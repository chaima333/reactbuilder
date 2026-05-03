// modules/pages/commands/updatePage.handler.ts
import { Page } from "../../../models/page";
import { EventBus, detectChanges } from "../../../core/plugins/events/eventBus";

export const updatePageHandler = async (command) => {
  const { payload, context } = command;

  // 1. جلب البيانات الأصلية قبل أي تعديل
  const page = await Page.findOne({
    where: { id: payload.pageId, siteId: context.siteId }
  });

  if (!page) throw new Error("Page not found");

  // 🛡️ الـ Architect Move: تجميد البيانات القديمة تماماً (Deep Copy)
  const oldData = JSON.parse(JSON.stringify(page.get({ plain: true })));

  // 2. التحديث
  await page.update({
    title: payload.title,
    content: payload.content,
    blocks: payload.blocks
  });

  // 🔥 الـ Reload الإجباري لضمان مزامنة الـ Memory مع الـ DB
  await page.reload();
  const currentData = page.get({ plain: true });

  // 3. حساب التغييرات الحقيقية
  const changes = detectChanges(oldData, currentData);

  // 🧪 Debugging Brutal
  console.log(`🧪 [DIFF CHECK] Old: "${oldData.title}" | New: "${currentData.title}"`);
  console.log(`🧪 [CHANGES]:`, changes);

  // 4. الـ Guard: متبعثش event لو ما فماش تغيير حقيقي
  if (changes.length === 0) {
    console.log("ℹ️ No meaningful changes. Skipping EventBus.");
    return { success: true, updated: false };
  }

  // 5. الإرسال بالعقد الجديد (Unified Data Structure)
  await EventBus.emit({
    type: "page.updated",
    data: { 
      current: currentData, 
      previous: oldData, 
      changes,
      flags: {
        shouldVersion: changes.includes("blocks") || changes.includes("content"),
        shouldSEO: changes.includes("title")
      }
    },
    context: {
      userId: Number(context.userId),
      siteId: Number(context.siteId),
      action: "update"
    }
  });

  return {
    success: true,
    updated: true,
    pageId: payload.pageId
  };
};
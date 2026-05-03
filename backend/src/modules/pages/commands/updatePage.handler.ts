// modules/pages/commands/updatePage.handler.ts
import { Page } from "../../../models/page";
import { EventBus, detectChanges } from "../../../core/plugins/events/eventBus";

// modules/pages/commands/updatePage.handler.ts
export const updatePageHandler = async (command) => {
  const { payload, context } = command;

  const page = await Page.findOne({
    where: { id: payload.pageId, siteId: context.siteId }
  });

  if (!page) throw new Error("Page not found");

  // 🛡️ تجميد البيانات القديمة (Deep Copy) لضمان عدم تأثرها بالـ Update
  const oldData = JSON.parse(JSON.stringify(page.get({ plain: true })));

  // التنفيذ
  await page.update({
    title: payload.title,
    content: payload.content,
    blocks: payload.blocks
  });

  // 🔥 الـ Reload الإجباري: إجبار Sequelize على قراءة الحقيقة من الـ DB
  await page.reload();
  const currentData = page.get({ plain: true });

  // حساب التغييرات
  const changes = detectChanges(oldData, currentData);

  // 🧪 Brutal Debugging
  console.log(`🧪 [DIFF] Old: "${oldData.title}" | New: "${currentData.title}"`);
  console.log(`🧪 [CHANGES]:`, changes);

  // 🛑 Guard Clause: متبعثش Event لو ما فماش تغيير حقيقي
  if (changes.length === 0) {
    console.log("ℹ️ Skipping EventBus: No actual changes.");
    return { success: true, updated: false };
  }

  // الإرسال بالعقد الجديد الموحد (Unified Event Data)
  await EventBus.emit({
    type: "page.updated",
    data: { 
      current: currentData, 
      previous: oldData, 
      changes,
      flags: {
        shouldVersion: changes.includes("blocks"),
        shouldSEO: changes.includes("title")
      }
    },
    context: {
      userId: Number(context.userId),
      siteId: Number(context.siteId),
      action: "update"
    }
  });

  return { success: true, updated: true, pageId: payload.pageId };
};
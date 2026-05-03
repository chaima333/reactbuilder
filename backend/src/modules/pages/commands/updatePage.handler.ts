// modules/pages/commands/updatePage.handler.ts
import { Page } from "../../../models/page";
import { EventBus, detectChanges } from "../../../core/plugins/events/eventBus";

export const updatePageHandler = async (command) => {
  const { payload, context } = command;

  // 1. جلب البيانات القديمة (قبل التعديل)
  const page = await Page.findOne({
    where: { id: payload.pageId, siteId: context.siteId }
  });

  if (!page) throw new Error("Page not found or access denied");

  // 🛡️ هوني السر: نصنعوا نسخة مستقلة تماماً في الذاكرة (Deep Copy)
  const oldData = JSON.parse(JSON.stringify(page.get({ plain: true })));

  // 2. التنفيذ
  await page.update({
    title: payload.title,
    content: payload.content,
    blocks: payload.blocks
  });

  // 🛡️ نجلبوا البيانات الجديدة بعد الـ Update لضمان الدقة
  const newData = page.get({ plain: true });

  // 3. كشف التغييرات
  const changes = detectChanges(oldData, newData);

  // 🧪 TEST LOGS (نحيهم بعد ما تتأكد إنها خدمت)
  console.log("-----------------------------------------");
  console.log(`🧪 [DIFF] Old Title: "${oldData.title}" | New Title: "${newData.title}"`);
  console.log(`🧪 [DIFF] Changes detected:`, changes);
  console.log("-----------------------------------------");

  // 4. 🚨 الـ Guard (منع الـ Spam)
  if (changes.length === 0) {
    console.log("ℹ️ Skipping EventBus: No actual changes in data.");
    return { 
        success: true, 
        updated: false, 
        message: "No changes detected" 
    };
  }

  // 5. الإرسال بالعقد الموحد (UnifiedEvent)
  await EventBus.emit({
    type: "page.updated",
    data: { 
        current: newData, 
        previous: oldData, 
        changes 
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
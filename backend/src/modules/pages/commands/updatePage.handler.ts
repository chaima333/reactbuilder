import { detectChanges, eventBus } from "../../../core/plugins/events/eventBus";
import { Page } from "../../../models/page";

export const updatePageHandler = async (command) => {
  const { payload, context } = command;
 console.log(`🔍 Searching for Page: ${payload.pageId} in Site: ${context.siteId}`);

  // 1️⃣ جيب الداتا القديمة قبل التحديث (ضروري للمقارنة)
  const oldPage = await Page.findOne({
  where: { id: payload.pageId, siteId: context.siteId }
});

if (!oldPage) {
  console.error("❌ Page not found in this specific site context!");
  throw new Error("Page not found");
}
  // 2️⃣ التحديث في قاعدة البيانات
  await Page.update(
    { title: payload.title, content: payload.content, blocks: payload.blocks },
    { where: { id: payload.pageId, siteId: context.siteId } }
  );

  // 3️⃣ استعمل الدالة متاعك باش تطلع الـ Diff
  const changes = detectChanges(oldPage.toJSON(), payload);

  console.log("🔍 Changes detected:", changes);

  // 4️⃣ ابعث للـ EventBus (وهو يتصرف مع الـ Queue)
  if (changes.length > 0) {
    await eventBus.emit("page.updated", {
      siteId: context.siteId,
      userId: context.userId,
      payload: { pageId: payload.pageId, ...payload },
      changes: changes // الـ Plugins توّة يعرفو بالضبط شنوّة تبدل
    });
  }

  return { success: true, updated: true, pageId: payload.pageId };
};
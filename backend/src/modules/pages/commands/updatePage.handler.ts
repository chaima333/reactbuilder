import { Page } from "../../../models/page";
import { EventBus, detectChanges } from "../../../core/plugins/events/eventBus";

export const updatePageHandler = async (command) => {
  const { payload, context } = command;

  const page = await Page.findOne({
    where: { id: payload.pageId, siteId: context.siteId }
  });

  if (!page) throw new Error("Page not found or access denied");

  const oldData = page.get({ plain: true });

  await page.update({
    title: payload.title,
    content: payload.content,
    blocks: payload.blocks
  });

  const newData = page.get({ plain: true });
  const changes = detectChanges(oldData, newData);

  console.log(`🔍 Changes detected for Page ${payload.pageId}:`, changes);

  if (changes.length > 0) {
    await EventBus.emit({
      type: "page.updated",
      data: {
        current: newData,
        previous: oldData,
        changes,
        flags: {
          shouldVersion: changes.includes("blocks"),
          shouldSEO: changes.includes("title")
        }
      },
      // ✅ التصحيح هنا: إضافة الحقول المطلوبة وحذف meta
      context: {
        userId: Number(context.userId),
        siteId: Number(context.siteId),
        action: "update" // 👈 هذا هو الحقل اللي كان ناقص وعمل الخطأ
      }
    });
  }

  return {
    success: true,
    updated: changes.length > 0,
    pageId: payload.pageId
  };
};
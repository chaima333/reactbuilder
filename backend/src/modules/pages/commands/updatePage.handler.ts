// modules/pages/commands/updatePage.handler.ts
import { Page } from "../../../models/page";
import { pluginQueue } from "../../../core/queues/plugin.queue"; // 🔥 استورد الـ Queue

export const updatePageHandler = async (command) => {
  const { payload, context } = command;

  // 1. تحديث البيانات الحقيقية
  await Page.update(
    { title: payload.title },
    { where: { id: payload.pageId, siteId: context.siteId } }
  );

  console.log("🔥 PAGE UPDATED IN DB:", payload.pageId);

  // 2. تفعيل الـ Pipeline (الـ Plugins توّة باش تبدا تخدم) 🚀
  // نبعثو الـ Job للـ BullMQ
  await pluginQueue.add("plugin-execution", {
    event: "page.updated",
    siteId: context.siteId,
    userId: context.userId,
    payload: {
      pageId: payload.pageId,
      title: payload.title
    }
  });

  return {
    success: true,
    updated: true,
    pageId: payload.pageId
  };
};
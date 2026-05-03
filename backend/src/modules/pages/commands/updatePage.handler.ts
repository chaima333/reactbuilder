import { eventBus } from "../../../core/plugins/events/eventBus";
import { Page } from "../../../models/page";

export const updatePageHandler = async (command) => {
  const { payload, context } = command;

  const page = await Page.update(
    { title: payload.title },
    { where: { id: payload.pageId, siteId: context.siteId } }
  );

  // 🔥 IMPORTANT: emit event
  await eventBus.emit("page.updated", {
    pageId: payload.pageId,
    siteId: context.siteId,
    userId: context.userId
  });

  return {
    success: true,
    updated: true,
    pageId: payload.pageId
  };
};
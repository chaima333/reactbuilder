import { Page } from "../../../models/page";
import { EventBus, detectChanges } from "../../../core/plugins/events/eventBus"; 

export const updatePageHandler = async (command) => {
  const { payload, context } = command;

  const oldPage = await Page.findOne({
    where: { id: payload.pageId, siteId: context.siteId }
  });
  
  if (!oldPage) throw new Error("Page not found or access denied");

  await Page.update(
    { 
      title: payload.title, 
      content: payload.content, 
      blocks: payload.blocks 
    },
    { where: { id: payload.pageId, siteId: context.siteId } }
  );

  const changes = detectChanges(oldPage.get({ plain: true }), payload);

  console.log(`🔍 Changes detected for Page ${payload.pageId}:`, changes);

  if (changes.length > 0) {
    await EventBus.emit("page.updated", {
  context: {
    eventId: crypto.randomUUID(),
    userId: context.userId,
    siteId: context.siteId,
    action: "update",
    timestamp: Date.now(),
    source: "page.handler"
  },

  data: {
    pageId: payload.pageId,
    changes,
    current: {
      title: payload.title,
      content: payload.content,
      blocks: payload.blocks
    }
  }
});
  }

  return { 
    success: true, 
    updated: changes.length > 0, 
    pageId: payload.pageId 
  };
};
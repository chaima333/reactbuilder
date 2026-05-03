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

// 2. 🚨 منع الـ "Spam" (Decision Maker)
if (changes.length === 0) {
    console.log("ℹ️ No changes detected. Skipping EventBus.");
    return { success: true, updated: false };
}

// 3. الإرسال بالعقد الجديد (Barameter واحد منظم)
await EventBus.emit({
    type: "page.updated",
    data: { current: newData, previous: oldData, changes },
    context: {
        userId: Number(context.userId),
        siteId: Number(context.siteId),
        action: "update"
    }
});

  return {
    success: true,
    updated: changes.length > 0,
    pageId: payload.pageId
  };
};
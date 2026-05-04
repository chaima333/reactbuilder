// modules/pages/commands/updatePage.handler.ts
import { Page } from "../../../models/page";
import { EventBus, detectChanges } from "../../../core/plugins/events/eventBus";

// modules/pages/commands/updatePage.handler.ts

export const updatePageHandler = async (command) => {
  const { payload, context } = command;
  const page = await Page.findOne({ where: { id: payload.pageId, siteId: context.siteId } });
  if (!page) throw new Error("Page not found");

  // ✅ 1. Deep Copy: نسخة حقيقية ومستقلة تماما
  const oldData = JSON.parse(JSON.stringify(page.get({ plain: true })));

  await page.update({ title: payload.title, content: payload.content, blocks: payload.blocks });
  await page.reload();
  
  const currentData = page.get({ plain: true });
  const changes = detectChanges(oldData, currentData);

  if (changes.length === 0) return { success: true, updated: false };

  // ✅ 2. Clean Context: نحينا الـ source وخليناها للـ Bus
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
// modules/pages/commands/updatePage.handler.ts
import { Page } from "../../../models/page";
import { EventBus, detectChanges } from "../../../core/plugins/events/eventBus";

export const updatePageHandler = async (command) => {
  const { payload, context } = command;

  const page = await Page.findOne({
    where: { id: payload.pageId, siteId: context.siteId }
  });

  if (!page) throw new Error("Page not found");

  // 🛡️ الـ Deep Copy لضمان استقرار الـ diff
  const oldData = JSON.parse(JSON.stringify(page.get({ plain: true })));

  // التحديث
  await page.update({
    title: payload.title,
    content: payload.content,
    blocks: payload.blocks
  });

  // 🔥 الـ Reload لضمان قراءة الداتا الجديدة من الـ DB
  await page.reload();
  const currentData = page.get({ plain: true });

  const changes = detectChanges(oldData, currentData);

  // 🛑 Guard Clause
  if (changes.length === 0) {
    console.log("ℹ️ Skipping: No actual changes.");
    return { success: true, updated: false };
  }

  // الإرسال بالعقد الجديد
  await EventBus.emit({
    type: "page.updated",
    data: { 
      current: currentData, 
      previous: oldData, 
      changes: changes,
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

  return { success: true, updated: true, pageId: payload.pageId };
};
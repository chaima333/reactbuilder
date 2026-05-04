import { Page } from "../../../models/page";
import { normalizePage } from "../../../core/plugins/events/contracts/unified.contract.ts";
import { emitDomainEvent, getSemanticDiff } from "../domain/diff"; // ثبت المسار هنا

// src/modules/pages/commands/updatePage.handler.ts

export const updatePageHandler = async (command: any) => {
  const { payload, context } = command;
  const page = await Page.findByPk(payload.pageId);
  if (!page) return { success: false, error: "Page not found" };

  const oldPageN = normalizePage(page);
  await page.update(payload);
  const currentPageN = normalizePage(await page.reload());

  // 1. غربلة التغييرات الحقيقية (No spaces, no noise)
  const meaningfulChanges = getSemanticDiff(oldPageN, currentPageN);

  // 2. [BRAIN] إذا ما ثماش حاجة تستحق، نوقفوا هنا
  if (meaningfulChanges.length === 0) {
    console.log("🤫 [ENGINE] No meaningful changes → Silent success.");
    return { success: true, updated: false, data: currentPageN };
  }

  // 3. [BRAIN] تحديد المهام (Rules Engine)
  const flags = {
    shouldVersion: meaningfulChanges.some(c => ["title", "content", "blocks"].includes(c)),
    shouldSEO: meaningfulChanges.some(c => ["title", "slug"].includes(c)),
    isStatusChange: meaningfulChanges.includes("status")
  };

  // 4. [BRAIN] إرسال الأمر للتنفيذ فقط
  await emitDomainEvent("page.updated", {
    current: currentPageN,
    previous: oldPageN,
    changes: meaningfulChanges,
    flags // الـ Worker والـ Plugins يقرأوا من هنا فقط، ما عادش "يفكروا"
  }, context);

  return { success: true, updated: true, data: currentPageN };
};
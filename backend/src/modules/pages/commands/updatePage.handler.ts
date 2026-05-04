import { Page } from "../../../models/page";
import { normalizePage } from "../../../core/plugins/events/contracts/unified.contract.ts";
import { emitDomainEvent, getSemanticDiff } from "../domain/diff"; // ثبت المسار هنا

// src/modules/pages/commands/updatePage.handler.ts
export const updatePageHandler = async (command: any) => {
  const { payload, context } = command;

  if (!payload?.pageId) return { success: false, error: "Page ID is required" };

  const page = await Page.findByPk(payload.pageId);
  if (!page) return { success: false, error: "Page not found" };

  // 1. التطهير الأول
  const oldPageN = normalizePage(page);

  // 2. التحديث
  await page.update(payload);
  const updatedPage = await page.reload();
  
  // 3. التطهير الثاني
  const currentPageN = normalizePage(updatedPage);

  // 4. المقارنة (الآن صارت آمنة)
  const changes = getSemanticDiff(oldPageN, currentPageN);

  if (changes.length === 0) {
    return { success: true, updated: false, data: currentPageN };
  }

  // 3. الـ Single Authority: بعث الحدث عبر البوابة الوحيدة
  await emitDomainEvent("page.updated", {
    current: currentPageN,
    previous: oldPageN,
    changes,
    flags: {
      shouldVersion: changes.some(c => ["title", "content", "blocks"].includes(c)),
      shouldSEO: changes.some(c => ["title", "slug"].includes(c))},
    },{
    ...context, 
    action: "update" // ✅ تأكد أنها "update" وليس "UPDATED" أو غيرها
});

  return { success: true, updated: true, data: currentPageN };
};
import { Page } from "../../../models/page";
import { normalizePage } from "../../../core/plugins/events/contracts/unified.contract.ts";
import { emitDomainEvent, getSemanticDiff } from "../domain/diff"; // ثبت المسار هنا


export const updatePageHandler = async (command: any) => {
  const { payload, context } = command;
  const page = await Page.findByPk(payload.pageId);
  if (!page) return { success: false, error: "Page not found" };

  const oldPageN = normalizePage(page);
  await page.update(payload);
  const currentPageN = normalizePage(await page.reload());

  // 🎯 المخ يقرر: ما هي التغييرات الحقيقية فقط؟
  const ALLOWED_FIELDS = ["title", "content", "blocks", "slug", "status"];
  const meaningfulChanges = ALLOWED_FIELDS.filter(field => {
    return JSON.stringify(oldPageN[field]) !== JSON.stringify(currentPageN[field]);
  });

  // 🤫 إذا التغيير "تافه" (فقط updatedAt)، نقتل العملية هنا
  if (meaningfulChanges.length === 0) {
    return { success: true, updated: false, data: currentPageN };
  }

  // 🧠 المخ يوزع المهام عبر الـ Flags
  const flags = {
    shouldVersion: meaningfulChanges.some(c => ["title", "content", "blocks"].includes(c)),
    shouldSEO: meaningfulChanges.some(c => ["title", "slug"].includes(c))
  };

  await emitDomainEvent("page.updated", {
    current: currentPageN,
    previous: oldPageN,
    changes: meaningfulChanges, // نبعثوا كان الـ meaningful
    flags
  }, {
    ...context,
    action: "update", // تأكد إنها تطابق الـ Validator 100%
    source: "page.handler" 
  });

  return { success: true, updated: true, data: currentPageN };
};
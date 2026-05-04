import { Page } from "../../../models/page";
import { normalizePage } from "../../../core/plugins/events/contracts/unified.contract.ts";
import { emitDomainEvent, getSemanticDiff } from "../domain/diff"; // ثبت المسار هنا

export const updatePageHandler = async (command: any) => {
  const { payload, context } = command;

  const page = await Page.findByPk(payload.pageId);
  if (!page) return { success: false, error: "Page not found" };

  const oldPageN = normalizePage(page);

  // تحديث البيانات
  await page.update(payload);
  const currentPageN = normalizePage(await page.reload());

  // 1. حساب التغييرات الحقيقية (Pure Logic)
  const changes = getSemanticDiff(oldPageN, currentPageN);

  // 2. الـ Guard: إذا ما فماش تغيير حقيقي، أخرج بكرامتك
  if (changes.length === 0) {
    console.log("🤫 [HANDLER] No semantic changes. Flow stopped.");
    return { success: true, updated: false };
  }

  // 3. الـ Single Authority: بعث الحدث عبر البوابة الوحيدة
  await emitDomainEvent("page.updated", {
    current: currentPageN,
    previous: oldPageN,
    changes,
    flags: {
      shouldVersion: changes.some(c => ["title", "content", "blocks"].includes(c)),
      shouldSEO: changes.some(c => ["title", "slug"].includes(c))
    }
  }, context);

  return { success: true, updated: true, data: currentPageN };
};
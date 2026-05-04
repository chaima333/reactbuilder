import { Page } from "../../../models/page";
import { EventBus } from "../../../core/plugins/events/eventBus";
import { PageClassifier } from "../domain/diff";

export const updatePageHandler = async (command: any) => {
  const { payload, context: cmdContext } = command;

  // 1. Fetch
  const page = await Page.findOne({ where: { id: payload.pageId, siteId: cmdContext.siteId } });
  if (!page) throw new Error("Page not found");

  const oldRaw = page.get({ plain: true });

  // 2. Update & Reload
  await page.update(payload);
  await page.reload();
  const currentRaw = page.get({ plain: true });

  // 3. 🧠 THE BRAIN: Single Source of Truth
  // الـ Classifier هو الوحيد اللي عنده الحق يقرر نوع التغيير
  const report = PageClassifier.analyze(oldRaw, currentRaw);

  // 🛑 الجدار العازل: إذا التصنيف "Noise" أو "No Change"
  if (report.type === 'NO_CHANGE' || report.type === 'COSMETIC') {
    console.log(`🤫 [DETERMINISTIC-GATE] Ignored ${report.type}. Reason: ${report.reason}`);
    return { success: true, updated: false, data: currentRaw };
  }

  // 🚀 إذا وصلنا هنا، يعني التغيير SEMANTIC ومستحق بالرسمي
  // الـ Flags توّة تخرج من الـ Classifier بيدو (Consistency)
  await EventBus.emit({
    type: "page.updated",
    data: {
      current: currentRaw,
      previous: oldRaw,
      changes: report.diff,
      flags: report.flags // الـ Flags ولات Deterministic
    },
    context: { siteId: cmdContext.siteId, userId: cmdContext.userId, action: "update" }
  });

  console.log(`✅ [SAAS-ENGINE] High-Value Event Emitted. Type: ${report.type}`);
  return { success: true, updated: true, data: currentRaw };
};
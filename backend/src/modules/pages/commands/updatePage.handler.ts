import { Page } from "../../../models/page";
import { EventBus } from "../../../core/plugins/events/eventBus";
import { SEO_RULES, VERSIONING_RULES } from "../domain/rules";

// 🧼 1. Normalization Layer: توحيد الداتا
export const normalizePage = (data: any) => {
  if (!data) return null;
  return {
    id: data.id,
    title: String(data.title || "").trim(),
    slug: String(data.slug || "").trim().toLowerCase(),
    content: String(data.content || "").trim(),
    blocks: JSON.stringify(data.blocks || []),
    status: data.status,
    userId: Number(data.userId || data.user_id),
    siteId: Number(data.siteId || data.site_id),
  };
};

// 🧠 2. Semantic Diff Engine: المقارنة الذكية
const getSemanticChanges = (oldN: any, newN: any): string[] => {
  return Object.keys(newN).filter((key) => {
    // إذا كان التغيير مجرد حروف كبيرة/صغيرة أو فراغات في العناوين، نعتبروه "لا يوجد تغيير"
    if (['title', 'slug'].includes(key)) {
      return oldN[key].toLowerCase() !== newN[key].toLowerCase();
    }
    return oldN[key] !== newN[key];
  });
};

export const updatePageHandler = async (command: any) => {
  const { payload, context: cmdContext } = command;

  const page = await Page.findOne({
    where: { id: payload.pageId, siteId: cmdContext.siteId }
  });

  if (!page) throw new Error("Page not found");

  // الحالة القديمة
  const oldDataRaw = page.get({ plain: true });
  const oldDataNormalized = normalizePage(oldDataRaw);

  // التحديث في القاعدة
  await page.update(payload);
  await page.reload();

  // الحالة الجديدة
  const currentDataRaw = page.get({ plain: true });
  const currentDataNormalized = normalizePage(currentDataRaw);

  // 🔥 الـ GATE الأول: هل فما تغيير حقيقي؟
  const semanticChanges = getSemanticChanges(oldDataNormalized, currentDataNormalized);

  if (semanticChanges.length === 0) {
    console.log("🤫 [GATE] No semantic changes detected (only noise/whitespace). Suppression active.");
    return { success: true, updated: false, pageId: payload.pageId, data: currentDataRaw };
  }

  // 🔥 الـ GATE الثاني: هل التغيير يستحق تشغيل الـ Plugins؟
  const shouldVersion = VERSIONING_RULES.shouldCreateVersion(
    semanticChanges,
    oldDataNormalized,
    currentDataNormalized
  );
  
  const shouldSEO = SEO_RULES.shouldUpdateSEO(semanticChanges);

  // 🛑 إذا التغيير ما يستحقش لا Version ولا SEO، نوقفو هنا وما نبعثوش Event
  if (!shouldVersion && !shouldSEO) {
    console.log(`🛑 [GATE] Changes [${semanticChanges.join(",")}] are minor. Skipping EventBus.`);
    return { success: true, updated: true, pageId: payload.pageId, data: currentDataRaw };
  }

  // 🚀 إرسال الـ Event فقط إذا كان "صيد ثمين" (High Value)
  await EventBus.emit({
    type: "page.updated",
    data: {
      current: currentDataRaw,
      previous: oldDataRaw,
      changes: semanticChanges,
      flags: { shouldVersion, shouldSEO }
    },
    context: {
      userId: Number(currentDataNormalized.userId),
      siteId: Number(currentDataNormalized.siteId),
      action: "update"
    }
  });

  console.log(`✅ [ENGINE] Meaningful Event Emitted: ${semanticChanges.join(", ")}`);

  return { success: true, updated: true, pageId: payload.pageId, data: currentDataRaw };
};
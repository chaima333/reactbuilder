import { Page } from "../../../models/page";
import { EventBus, detectChanges } from "../../../core/plugins/events/eventBus";
import { SEO_RULES, VERSIONING_RULES } from "../domain/rules";
/**
 * 🧹 Canonical State Normalizer
 * وظيفتها توحيد البيانات (حذف الفراغات، توحيد الأنواع) لضمان مقارنة Semantic صحيحة
 */
const normalizePageData = (raw: any) => {
  if (!raw) return null;
  return {
    id: raw.id,
    title: String(raw.title || "").trim(),
    slug: String(raw.slug || "").trim(),
    content: String(raw.content || "").trim(),
    // تحويل الـ Objects لـ String يضمن إنو المقارنة ما تفيقش باختلاف الترتيب التافه
    blocks: JSON.stringify(raw.blocks || []),
    status: raw.status,
    userId: Number(raw.userId || raw.user_id), 
    siteId: Number(raw.siteId || raw.site_id), 
    metaData: JSON.stringify(raw.metaData || raw.meta_data || {})
  };
};

export const updatePageHandler = async (command: any) => {
  const { payload, context: cmdContext } = command;
  
  const page = await Page.findOne({ 
    where: { id: payload.pageId, siteId: cmdContext.siteId } 
  });
  
  if (!page) throw new Error("Page not found");

  const oldDataRaw = page.get({ plain: true });
  const oldDataNormalized = normalizePageData(oldDataRaw);

  await page.update(payload);
  await page.reload();
  
  const currentDataRaw = page.get({ plain: true });
  const currentDataNormalized = normalizePageData(currentDataRaw);

  const changes = detectChanges(oldDataNormalized, currentDataNormalized);

  if (changes.length === 0) return { success: true, updated: false };

  const shouldVersion = VERSIONING_RULES.shouldCreateVersion(changes, oldDataNormalized, currentDataNormalized);
  const shouldSEO = SEO_RULES.shouldUpdateSEO(changes);

  // 🔥 تحضير الـ Event بناءً على الـ Strict Contract الجديد
  const traceId = crypto.randomUUID();

  await EventBus.emit({
    type: "page.updated",
    // الـ traceId والـ id والـ timestamp الـ EventBus هو اللي باش يصنعهم أوتوماتيكياً
    // إحنا نبعثو فقط الـ data والـ context المطلوبين
    data: {
      current: currentDataRaw,
      previous: oldDataRaw,
      changes,
      flags: { shouldVersion, shouldSEO }
    },
    context: {
      userId: Number(currentDataNormalized.userId),
      siteId: Number(currentDataNormalized.siteId),
      action: "update", 
      // الـ source توّة الـ EventBus باش يعطيها القيمة "page.handler" أوتوماتيكياً
      // والـ traceId باش يتعدى للـ Root متاع الـ UnifiedEvent
    }
  });

  return { success: true, updated: true, pageId: payload.pageId };
};
import { Page } from "../../../models/page";
import { EventBus, detectChanges } from "../../../core/plugins/events/eventBus";
import { SEO_RULES, VERSIONING_RULES } from "../domain/rules";

/**
 * 🧼 Normalization Layer
 * وظيفتها تحويل البيانات لمستوى "Canonical" (نظيف وموحد)
 * هكّة نضمنوا إنو "Title" هو بيدو " Title  " وما نغلطوش السيستيم
 */
export const normalizePage = (data: any) => {
  if (!data) return null;
  return {
    id: data.id,
    title: String(data.title || "").trim(),
    slug: String(data.slug || "").trim().toLowerCase(),
    content: String(data.content || "").trim(),
    // Stringify للـ Objects لضمان إنو ترتيب الـ Keys ما يأثرش على الـ Diff
    blocks: JSON.stringify(data.blocks || []),
    status: data.status,
    userId: Number(data.userId || data.user_id),
    siteId: Number(data.siteId || data.site_id),
    metaData: JSON.stringify(data.metaData || data.meta_data || {})
  };
};

export const updatePageHandler = async (command: any) => {
  const { payload, context: cmdContext } = command;
  
  // 1. التثبت من وجود الصفحة
  const page = await Page.findOne({ 
    where: { id: payload.pageId, siteId: cmdContext.siteId } 
  });
  
  if (!page) throw new Error("Page not found");

  // 2. تصوير الحالة القديمة (Normalized)
  const oldDataRaw = page.get({ plain: true });
  const oldDataNormalized = normalizePage(oldDataRaw);

  // 3. التحديث الفعلي في القاعدة
  await page.update({
    title: payload.title,
    content: payload.content,
    blocks: payload.blocks,
    slug: payload.slug,
    status: payload.status,
    metaData: payload.metaData
  });
  
  // 4. جلب الحالة الجديدة (Normalized)
  await page.reload();
  const currentDataRaw = page.get({ plain: true });
  const currentDataNormalized = normalizePage(currentDataRaw);

  // 5. 🧠 Semantic Diff Engine
  // المقارنة توّة تصير بين بيانات نظيفة، يعني الـ Spaces الزايدة ماتخلقش Events
  const changes = detectChanges(oldDataNormalized, currentDataNormalized);

  // 🛑 إذا ما فماش تغيير حقيقي (بعد الـ Normalization)، نوقفو هنا
  if (changes.length === 0) {
    console.log("🤫 [STABILITY] Change ignored: No semantic differences detected.");
    return { 
      success: true, 
      updated: false, 
      pageId: payload.pageId, 
      data: currentDataRaw 
    };
  }

  // 6. تطبيق الـ Business Rules الذكية
  const shouldVersion = VERSIONING_RULES.shouldCreateVersion(
    changes, 
    oldDataNormalized, 
    currentDataNormalized
  );
  
  const shouldSEO = SEO_RULES.shouldUpdateSEO(changes);

  // 7. إرسال الـ Event الموثوق
  // نبعثو الـ currentDataRaw (الـ Object الأصلي) للـ Plugins باش ينجمو يخدمو
  await EventBus.emit({
    type: "page.updated",
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
      // الـ EventBus سيتولى إضافة الـ traceId والـ source أوتوماتيكياً
    }
  });

  console.log(`✅ [EVENT] Page ${payload.pageId} updated. Changes: ${changes.join(", ")}`);

  return { 
    success: true, 
    updated: true, 
    pageId: payload.pageId, 
    data: currentDataRaw 
  };
};
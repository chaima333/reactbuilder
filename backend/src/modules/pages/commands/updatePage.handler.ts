// modules/pages/commands/updatePage.handler.ts
import { Page } from "../../../models/page";
import { EventBus, detectChanges } from "../../../core/plugins/events/eventBus";

/**
 * 🛡️ دالة لتنظيف البيانات وفرض الـ English Contract
 * تضمن إنو الـ Keys ديما camelCase وما فماش تضارب مع الـ DB field names
 */
const sanitizeForContract = (raw: any) => {
  if (!raw) return null;
  return {
    id: raw.id,
    title: raw.title,
    slug: raw.slug,
    content: raw.content,
    blocks: raw.blocks || [],
    status: raw.status,
    userId: raw.userId || raw.user_id, // توحيد المعرّفات
    siteId: raw.siteId || raw.site_id, // توحيد المعرّفات
    metaData: raw.metaData || raw.meta_data || {}
  };
};

export const updatePageHandler = async (command: any) => {
  const { payload, context } = command;
  
  // 1. البحث عن الصفحة
  const page = await Page.findOne({ 
    where: { id: payload.pageId, siteId: context.siteId } 
  });
  
  if (!page) throw new Error("Page not found");

  // ✅ 2. Deep Copy & Sanitize (قبل التعديل)
  // نستعملو sanitizeForContract باش الـ Comparison يكون دقيق وما يتأثرش بـ JSON.stringify الزايد
  const oldData = sanitizeForContract(JSON.parse(JSON.stringify(page.get({ plain: true }))));

  // 3. التحديث في قاعدة البيانات
  await page.update({ 
    title: payload.title, 
    content: payload.content, 
    blocks: payload.blocks 
  });
  
  await page.reload();
  
  // ✅ 4. Sanitize (بعد التعديل)
  const currentData = sanitizeForContract(page.get({ plain: true }));
  
  // 5. حساب التغييرات (على داتا نظيفة)
  const changes = detectChanges(oldData, currentData);

  // إذا ما فماش تغييرات حقيقية، نخرجوا
  if (changes.length === 0) {
    return { success: true, updated: false, data: currentData };
  }

  console.log("🔥 ACTUAL CLEAN DATA BEFORE BUS:", JSON.stringify({
    changes,
    userId: currentData?.userId,
    siteId: currentData?.siteId
  }, null, 2));

  // ✅ 6. الإرسال للـ EventBus مع فرض الـ Contract بالسيف
  await EventBus.emit({
    type: "page.updated",
    data: {
      current: currentData,
      previous: oldData,
      changes: changes,
      flags: {
        shouldVersion: changes.includes("blocks"),
        shouldSEO: changes.includes("title")
      }
    },
    context: {
      userId: Number(currentData?.userId || context.userId),
      siteId: Number(currentData?.siteId || context.siteId),
      action: "update" // Hardcoded English: ممنوع تولي miseÀJour
    }
  });

  return { 
    success: true, 
    updated: true, 
    pageId: payload.pageId, 
    data: currentData 
  };
};
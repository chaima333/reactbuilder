import { Page } from "../../../models/page";
import { normalizePage } from "../../../core/plugins/events/contracts/unified.contract.ts";
import { emitDomainEvent } from "../domain/diff"; 

export const updatePageHandler = async (command: any) => {
  try {
    const { payload, context } = command;

    // 1️⃣ جلب البيانات القديمة قبل التحديث
    const page = await Page.findByPk(payload.pageId);
    if (!page) return { success: false, error: "Page not found" };
    
    const oldPageN = normalizePage(page);

    // 2️⃣ تنفيذ التحديث وجلب النسخة الجديدة
    await page.update(payload);
    const updatedPage = await page.reload();
    const currentPageN = normalizePage(updatedPage);

    // 3️⃣ [The Brain] تصفية التغييرات الحقيقية (Content Only)
    // نحدد الحقول التي تستوجب فعلياً إرسال حدث
    const CORE_FIELDS = ["title", "content", "blocks", "slug", "status"];
    
    const meaningfulChanges = CORE_FIELDS.filter(field => {
      // نستخدم JSON.stringify لضمان المقارنة العميقة للمصفوفات (blocks)
      return JSON.stringify(oldPageN[field]) !== JSON.stringify(currentPageN[field]);
    });

    // 4️⃣ قرار استراتيجي: إذا لم يتغير شيء جوهري، توقف هنا
    if (meaningfulChanges.length === 0) {
      console.log(`ℹ️ [ENGINE] No core changes for Page ${payload.pageId}. Skipping event.`);
      return { success: true, updated: false, data: currentPageN };
    }

    // 5️⃣ تحديد الأعلام (Flags) لتوجيه الـ Plugins
    const flags = {
      shouldVersion: meaningfulChanges.some(c => ["title", "content", "blocks"].includes(c)),
      shouldSEO: meaningfulChanges.some(c => ["title", "slug"].includes(c))
    };

    // 6️⃣ بث الحدث للـ Bus
    await emitDomainEvent("page.updated", 
      {
        current: currentPageN,
        previous: oldPageN,
        changes: meaningfulChanges, // سترى الآن مصفوفة نظيفة في Redis
        flags
      }, 
      {
        ...context,
        action: "update",
        source: "page.handler" 
      }
    );

    return { success: true, updated: true, data: currentPageN };

  } catch (error: any) {
    console.error("❌ [HANDLER ERROR]:", error.message);
    return { success: false, error: error.message };
  }
};
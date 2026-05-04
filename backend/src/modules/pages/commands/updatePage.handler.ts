import { Page } from "../../../models/page";
import { normalizePage } from "../../../core/plugins/events/contracts/unified.contract.ts";
import { emitDomainEvent } from "../domain/diff"; 

export const updatePageHandler = async (command: any) => {
  try {
    const { payload, context } = command;

    // 1️⃣ استخراج البيانات القديمة
    const page = await Page.findByPk(payload.pageId);
    if (!page) return { success: false, error: "Page not found" };
    
    const oldPageN = normalizePage(page);

    // 2️⃣ التحديث و جلب البيانات الجديدة
    await page.update(payload);
    const updatedPage = await page.reload();
    const currentPageN = normalizePage(updatedPage);

    // 3️⃣ [The Brain] - حساب التغييرات الحقيقية فقط
    // نركز فقط على الحقول التي تهم الـ Business Logic
    const CORE_FIELDS = ["title", "content", "blocks", "slug", "status"];
    
    const meaningfulChanges = CORE_FIELDS.filter(field => {
      const valOld = oldPageN[field];
      const valNew = currentPageN[field];
      
      // استعمال JSON.stringify يضمن المقارنة العميقة للـ blocks والـ Objects
      return JSON.stringify(valOld) !== JSON.stringify(valNew);
    });

    // 4️⃣ صمام الأمان: إذا لم يتغير شيء حقيقي، ننهي العملية بصمت
    if (meaningfulChanges.length === 0) {
      console.log(`ℹ️ [ENGINE] Skip emission: No core field changes for Page ${payload.pageId}`);
      return { success: true, updated: false, data: currentPageN };
    }

    // 5️⃣ [Decision Logic] - تحديد الصلاحيات للـ Plugins
    const flags = {
      shouldVersion: meaningfulChanges.some(c => ["title", "content", "blocks"].includes(c)),
      shouldSEO: meaningfulChanges.some(c => ["title", "slug"].includes(c)),
      isStatusChange: meaningfulChanges.includes("status")
    };

    // 6️⃣ إرسال الحدث الموحد
    await emitDomainEvent("page.updated", 
      {
        current: currentPageN,
        previous: oldPageN,
        changes: meaningfulChanges,
        flags
      }, 
      {
        ...context,
        action: "update",       // متوافق مع Contract Validator
        source: "page.handler"  // متوافق مع Contract Validator
      }
    );

    return { 
      success: true, 
      updated: true, 
      changes: meaningfulChanges, 
      data: currentPageN 
    };

  } catch (error: any) {
    console.error("❌ [HANDLER ERROR] Page Update Failed:", error.message);
    return { 
      success: false, 
      error: error.message || "Internal Update Error" 
    };
  }
};
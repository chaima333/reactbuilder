// src/modules/pages/handlers/updatePage.handler.ts
import { Page } from "../../../models/page";
import { normalizePage } from "../../../core/plugins/events/contracts/unified.contract.ts";
import { emitDomainEvent, getSemanticDiff } from "../domain/diff"; 

export const updatePageHandler = async (command: any) => {
  try {
    const { payload, context } = command;

    // 1️⃣ جلب الحالة القديمة
    const page = await Page.findByPk(payload.pageId);
    if (!page) return { success: false, error: "Page not found" };
    const oldPageN = normalizePage(page);

    // 2️⃣ تنظيف الـ Payload (Deterministic)
    const allowedFields = ["title", "content", "blocks", "slug", "status"];
    const safePayload: any = {};
    
    allowedFields.forEach(field => {
      if (payload[field] !== undefined) {
        // تنظيف النصوص من الفراغات الزائدة
        safePayload[field] = typeof payload[field] === 'string' 
          ? payload[field].trim() 
          : payload[field];
      }
    });

    // 3️⃣ التحديث الفعلي
    await page.update(safePayload);
    const updatedPage = await page.reload();
    const currentPageN = normalizePage(updatedPage);

    // 4️⃣ حساب الفروقات الحقيقية (Semantic Diff)
    const meaningfulChanges = getSemanticDiff(oldPageN, currentPageN);

    // إذا لم يتغير شيء فعلي (مثلاً بعث نفس العنوان) نخرج بهدوء
    if (meaningfulChanges.length === 0) {
      return { success: true, updated: false, data: currentPageN };
    }

    // 5️⃣ بث الحدث للـ Bus (بدون تعقيد الـ Flags)
    await emitDomainEvent(
      "page.updated",
      {
        current: currentPageN,
        previous: oldPageN,
        changes: meaningfulChanges
      },
      {
        ...context,
        siteId: currentPageN.siteId, // مهم جداً للـ Gateway
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
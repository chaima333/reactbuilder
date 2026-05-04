import { normalizePage } from "../../../core/plugins/events/contracts/unified.contract.ts";
import { Page } from "../../../models/page";
import { emitDomainEvent, getSemanticDiff } from "../domain/diff";

// 🔒 قفل أمان لمنع التكرار من المصدر (Double Click / React StrictMode)
const inflightRequests = new Set<string>();

export const updatePageHandler = async (command: any) => {
  const { payload, context } = command;
  const lockKey = `update-${payload.pageId}`;

  // 1️⃣ التثبت من القفل
  if (inflightRequests.has(lockKey)) {
    console.log(`🛑 [HANDLER] Blocked: Request already in progress for page ${payload.pageId}`);
    return { success: false, error: "Request in progress" };
  }

  try {
    inflightRequests.add(lockKey); // تفعيل القفل

    const page = await Page.findByPk(payload.pageId);
    if (!page) return { success: false, error: "Page not found" };
    
    const oldPageN = normalizePage(page);

    // 2️⃣ تنظيف الـ Payload
    const allowedFields = ["title", "content", "blocks", "slug", "status"];
    const safePayload: any = {};
    allowedFields.forEach(field => {
      if (payload[field] !== undefined) {
        safePayload[field] = typeof payload[field] === 'string' ? payload[field].trim() : payload[field];
      }
    });

    // 3️⃣ التحديث
    await page.update(safePayload);
    const updatedPage = await page.reload();
    const currentPageN = normalizePage(updatedPage);

    // 4️⃣ حساب الفروقات الحقيقية
    const meaningfulChanges = getSemanticDiff(oldPageN, currentPageN);

    if (meaningfulChanges.length === 0) {
      return { success: true, updated: false, data: currentPageN };
    }

    // 5️⃣ بث الحدث مع الهوية الجديدة (UUID + Source + Depth)
    await emitDomainEvent(
      "page.updated",
      { current: currentPageN, previous: oldPageN, changes: meaningfulChanges },
      { 
        ...context, 
        siteId: currentPageN.siteId, 
        source: "page.handler", // تحديد المصدر بدقة
        action: "update" 
      }
    );

    return { success: true, updated: true, data: currentPageN };

  } catch (error: any) {
    console.error("❌ [HANDLER ERROR]:", error.message);
    return { success: false, error: error.message };
  } finally {
    // حل القفل بعد ثانية واحدة (Anti-spam window)
    setTimeout(() => inflightRequests.delete(lockKey), 1000);
  }
};
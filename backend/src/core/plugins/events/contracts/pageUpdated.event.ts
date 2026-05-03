// src/core/plugins/events/contracts/unified.contract.ts

// 1. القالب الأساسي لأي حدث في السيستيم
export type EventAction = "update" | "restore" | "publish" | "create" | "delete";

export interface UnifiedEvent<T = any> {
  id: string;         // UUID فريد لكل عملية
  type: string;       // "page.updated", "site.created", etc.
  timestamp: number;
  
  data: T;            // الـ Payload الأساسي (Strictly Data)

  context: {
    userId: number;
    siteId: number;
    action: EventAction;
    source: string;   // مثلاً "event.bus" أو "admin.panel"
  };
}

// 2. القالب الخاص بحدث تحديث الصفحات (Specific for Page Updates)
export interface PageUpdateData {
  current: any;       // الحالة الجديدة بعد الـ reload
  previous: any;      // الحالة القديمة قبل الـ update
  changes: string[];  // مصفوفة الحقول التي تغيرت فعلياً
  flags: {
    shouldVersion: boolean;
    shouldSEO: boolean;
  };
}

// 3. الـ Validator الموحد (The Gatekeeper)
export const validateEvent = (event: any): { isValid: boolean; error?: string } => {
  // تثبت أولي في الهيكل العام
  if (!event || typeof event !== 'object') return { isValid: false, error: "Event is null or not an object" };
  
  if (typeof event.id !== "string") return { isValid: false, error: "Missing or invalid id" };
  if (typeof event.type !== "string") return { isValid: false, error: "Missing or invalid type" };
  if (!event.data) return { isValid: false, error: "Event data is missing" };
  
  // تثبت في الـ Context (قلب العملية)
  const { context } = event;
  if (!context) return { isValid: false, error: "Context is missing" };
  if (typeof context.userId !== "number") return { isValid: false, error: "Invalid userId in context" };
  if (typeof context.siteId !== "number") return { isValid: false, error: "Invalid siteId in context" };
  if (!["update", "restore", "publish", "create", "delete"].includes(context.action)) {
    return { isValid: false, error: `Invalid action: ${context.action}` };
  }

  return { isValid: true };
};
// 1. القالب الأساسي لأي حدث في السيستيم
export interface UnifiedEvent<T = any> {
  id: string;         // عوض eventId
  type: string;       // مثلاً "page.updated"
  timestamp: number;
  
  data: T;            // المعلومات اللي تخص العملية (العنوان، التغييرات...)

  context: {
    userId: number;
    siteId: number;
    action: "update" | "restore" | "publish" | "create";
    source?: string;
  };
}


// 2. القالب الخاص بحدث تحديث الصفحات (Page Update)
export interface PageUpdateData {
  current: any;
  previous?: any;
  changes: string[];
  flags: {
    shouldVersion: boolean;
    shouldSEO: boolean;
  };
}

// 3. الـ Validator الموحد (بسيط وفعّال)
export const isValidUnifiedEvent = (event: any): event is UnifiedEvent => {
  return (
    event &&
    typeof event.id === "string" &&
    typeof event.type === "string" &&
    event.data !== undefined &&
    event.context &&
    typeof event.context.userId === "number" &&
    typeof event.context.siteId === "number"
  );
};
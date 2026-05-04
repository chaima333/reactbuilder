// core/contracts/unified.contract.ts

export type EventAction =
  | "update"
  | "restore"
  | "publish"
  | "create"
  | "delete";

export type EventSource =
  | "event.bus"
  | "page.handler"
  | "admin.panel";

export interface UnifiedEvent<T = any> {
  id: string;
  traceId: string;
  type: string;
  timestamp: number;

  data: T;

  context: {
    userId: number;
    siteId: number;
    action: EventAction;
    source: EventSource; // 🔥 strict type بدل string
  };
}

// Page-specific payload
export interface PageUpdateData {
  current: any;
  previous: any;
  changes: string[];
  flags: {
    shouldVersion: boolean;
    shouldSEO: boolean;
  };
}

// Validator (strict + consistent)

export const validateEvent = (event: any): { isValid: boolean; error?: string } => {
  if (!event || typeof event !== "object") return { isValid: false, error: "Invalid event" };

  // 🆔 تثبت من الـ IDs
  if (typeof event.id !== "string") return { isValid: false, error: "Invalid id" };
  if (typeof event.traceId !== "string") return { isValid: false, error: "Invalid traceId" }; // 🔥 لازم تزيد هذي

  if (typeof event.type !== "string") return { isValid: false, error: "Invalid type" };
  if (!event.data) return { isValid: false, error: "Missing data" };

  const ctx = event.context;
  if (!ctx) return { isValid: false, error: "Missing context" };

  // 👤 تثبت من الـ User والـ Site
  if (typeof ctx.userId !== "number") return { isValid: false, error: "Invalid userId" };
  if (typeof ctx.siteId !== "number") return { isValid: false, error: "Invalid siteId" };

  // 🛠️ تثبت من الـ Action (Enum check)
  const validActions = ["update", "restore", "publish", "create", "delete"];
  if (!validActions.includes(ctx.action)) return { isValid: false, error: "Invalid action" };

  // 🚀 تثبت من الـ Source (Enum check)
  const validSources = ["event.bus", "page.handler", "admin.panel"];
  if (!validSources.includes(ctx.source)) return { isValid: false, error: "Invalid source" }; // 🔥 تثبت أدق

  return { isValid: true };
};
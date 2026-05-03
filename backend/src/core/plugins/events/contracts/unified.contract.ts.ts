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
export const validateEvent = (
  event: any
): { isValid: boolean; error?: string } => {
  if (!event || typeof event !== "object")
    return { isValid: false, error: "Invalid event" };

  if (typeof event.id !== "string")
    return { isValid: false, error: "Invalid id" };

  if (typeof event.type !== "string")
    return { isValid: false, error: "Invalid type" };

  if (!event.data)
    return { isValid: false, error: "Missing data" };

  const ctx = event.context;

  if (!ctx)
    return { isValid: false, error: "Missing context" };

  if (typeof ctx.userId !== "number")
    return { isValid: false, error: "Invalid userId" };

  if (typeof ctx.siteId !== "number")
    return { isValid: false, error: "Invalid siteId" };

  if (!["update", "restore", "publish", "create", "delete"].includes(ctx.action))
    return { isValid: false, error: "Invalid action" };

  if (typeof ctx.source !== "string")
    return { isValid: false, error: "Missing source" };

  return { isValid: true };
};
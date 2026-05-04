export type EventAction = "update" | "restore" | "publish" | "create" | "delete";
export type EventSource = "event.bus" | "page.handler" | "admin.panel";

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
    source: EventSource;
    traceId: string;
    depth: number; // 🔥 لازم تزيدها هوني باش الـ Plugin يراها
    [key: string]: any; // يسمح بزيادة حقول أخرى بدون Errors
  };
}

export function normalizePage(page: any) {
  if (!page) return null;
  const raw = page.get ? page.get({ plain: true }) : page;

  let blocks = raw.blocks || [];
  if (typeof blocks === "string") {
    try { blocks = JSON.parse(blocks); } catch { blocks = []; }
  }

  return {
    id: raw.id,
    title: (raw.title || "").trim(),
    slug: (raw.slug || "").trim(),
    content: (raw.content || "").trim(),
    blocks: Array.isArray(blocks) ? blocks : [],
    status: raw.status,
    metaData: raw.metaData || {},
    userId: raw.userId ?? raw.user_id,
    siteId: raw.siteId ?? raw.site_id
  };
}

export const validateEvent = (event: any): { isValid: boolean; error?: string } => {
  if (!event || typeof event !== "object") return { isValid: false, error: "Invalid event" };
  if (typeof event.id !== "string") return { isValid: false, error: "Invalid id" };
  if (typeof event.traceId !== "string") return { isValid: false, error: "Invalid traceId" };
  if (typeof event.type !== "string") return { isValid: false, error: "Invalid type" };
  
  const ctx = event.context;
  if (!ctx) return { isValid: false, error: "Missing context" };
  if (typeof ctx.userId !== "number") return { isValid: false, error: "Invalid userId" };
  if (typeof ctx.siteId !== "number") return { isValid: false, error: "Invalid siteId" };

  return { isValid: true };
};







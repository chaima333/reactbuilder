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
    source: EventSource;
    depth: number;
  };
}


export const validateEvent = (event: any) => {
  if (!event) return { isValid: false, error: "missing event" };

  if (typeof event.id !== "string") {
    return { isValid: false, error: "invalid id" };
  }

  if (typeof event.traceId !== "string") {
    return { isValid: false, error: "invalid traceId" };
  }

  if (typeof event.type !== "string") {
    return { isValid: false, error: "invalid type" };
  }

  if (!event.context) {
    return { isValid: false, error: "missing context" };
  }

  const { userId, siteId, source, depth } = event.context;

  if (typeof userId !== "number") {
    return { isValid: false, error: "invalid userId" };
  }

  if (typeof siteId !== "number") {
    return { isValid: false, error: "invalid siteId" };
  }

  if (typeof source !== "string") {
    return { isValid: false, error: "invalid source" };
  }

  if (typeof depth !== "number" || depth < 0) {
    return { isValid: false, error: "invalid depth" };
  }

  return { isValid: true };
};

export function normalizePage(page: any) {
  if (!page) return null;

  const raw = page.get ? page.get({ plain: true }) : page;

  let blocks: any[] = [];

  try {
    if (typeof raw.blocks === "string") {
      blocks = JSON.parse(raw.blocks);
    } else if (Array.isArray(raw.blocks)) {
      blocks = raw.blocks;
    }
  } catch (err) {
    console.error("❌ Invalid blocks JSON:", err);
    blocks = [];
  }

  return {
    id: raw.id,
    title: (raw.title || "").trim(),
    slug: (raw.slug || "").trim(),
    content: (raw.content || "").trim(),
    blocks,
    status: raw.status,
    metaData: raw.metaData || {},
    userId: raw.userId ?? raw.user_id,
    siteId: raw.siteId ?? raw.site_id
  };
}





export function safeEvent(event: any) {
  if (!event) return null;
  if (!event.data) return null;
  if (!event.data.current) return null;
  if (typeof event.data.current.id === "undefined") return null;

  if (!event.context) return null;

  return {
    data: {
      current: event.data.current,
      previous: event.data.previous || null
    },
    context: {
      siteId: event.context.siteId,
      userId: event.context.userId,
      source: event.context.source || "unknown",
      depth: event.context.depth || 0,
      traceId: event.context.traceId
    }
  };
}
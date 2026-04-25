import { cmsRegistry } from "./plugin.registry";

export class EventDispatcher {
  private static processedIds = new Map<string, number>();
  private static TTL = 60_000;

  static async dispatch(event: string, payload: any, source: string) {
    const eventId = payload?._meta?.eventId;

    // 🛑 guard 1
    if (!eventId) {
      console.error(`🚨 [Dispatcher] Missing eventId for ${event}`);
      return;
    }

    const now = Date.now();

    // 🛑 guard 2 (idempotency)
    if (this.processedIds.has(eventId)) {
      console.warn(`⚠️ [Dispatcher] Duplicate blocked: ${eventId}`);
      return;
    }

    // 🧹 cleanup old entries (cheap GC)
    for (const [id, ts] of this.processedIds) {
      if (now - ts > this.TTL) {
        this.processedIds.delete(id);
      }
    }

    this.processedIds.set(eventId, now);

    console.log(`📡 [Dispatcher] → ${event} | ${eventId}`);

    await cmsRegistry.emit(event, payload, source);
  }
}
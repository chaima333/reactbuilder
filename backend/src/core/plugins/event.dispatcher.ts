import { cmsRegistry } from "./plugin.registry";

export class EventDispatcher {
  private static processed = new Set<string>();

  static async dispatch(event: string, payload: any, source: string) {
    const eventId = payload?._meta?.eventId;

    if (!eventId) return;

    if (this.processed.has(eventId)) return;
    this.processed.add(eventId);

    setTimeout(() => this.processed.delete(eventId), 60000);

    console.log(`📡 [Dispatcher] → ${event} | ${eventId}`);

    await cmsRegistry.emit(event, payload, source);
  }
}
import { cmsRegistry } from "./plugin.registry";

export class EventDispatcher {
  private static processed = new Set<string>();

  static async dispatch(event: string, payload: any, source: string) {

    const eventId = payload?.context?.eventId;

    if (!eventId) {
      console.error("🚨 Missing eventId");
      return;
    }

    if (this.processed.has(eventId)) return;

    this.processed.add(eventId);
    setTimeout(() => this.processed.delete(eventId), 60000);

    console.log(`📡 ${event} | ${eventId} | ${source}`);

    await cmsRegistry.emit(event, payload, source);
  }
}
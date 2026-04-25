import { cmsRegistry } from "./plugin.registry";

export class EventDispatcher {
  private static processedIds = new Set<string>();
  static async dispatch(event: string, payload: any, source: string) {
    const eventId = payload._meta?.eventId;
    if (!eventId) return;
    if (this.processedIds.has(eventId)) {
      return;
    }
    this.processedIds.add(eventId);
    setTimeout(() => this.processedIds.delete(eventId), 60000);
    console.log(`📡 [Dispatcher] Passing to Bus: ${event} | ID: ${eventId}`);
    await cmsRegistry.emit(event, payload, source); 
  }
}
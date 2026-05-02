import { addToQueue } from "../queues/plugin.queue";
import { eventStore } from "./events/event.store";

export class EventDispatcher {
  private static processed = new Set<string>();

  static async dispatch(event: string, payload: any, source: string) {
  const eventId = payload?.context?.eventId;

  if (!eventId) {
    console.error(`🚨 [Dispatcher] Missing ID for event: ${event}`);
    console.log("🔍 DEBUG PAYLOAD STRUCTURE:", JSON.stringify(payload, null, 2));
    return;
  }

  if (this.processed.has(eventId)) return;
  this.processed.add(eventId);
  setTimeout(() => this.processed.delete(eventId), 60000);

  console.log(`📡 [Dispatcher] → ${event} | ID: ${eventId} | Source: ${source}`);

 await addToQueue("plugin-tasks", { 
    event, 
    payload, 
    source 
  });

  eventStore.add({
  id: payload?.context?.eventId,
  type: event,
  timestamp: Date.now(),
  payload
});
}
}
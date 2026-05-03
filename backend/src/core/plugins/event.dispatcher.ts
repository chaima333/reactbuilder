import { addToQueue } from "../queues/plugin.queue";
import { eventStore } from "./events/event.store";

export class EventDispatcher {
  private static processed = new Set<string>();

  static async dispatch(event: string, payload: any, source: string = "system") {

    const eventId = payload?.context?.eventId;

    if (!eventId) {
      console.error(`🚨 Missing eventId for ${event}`);
      return;
    }

    if (this.processed.has(eventId)) return;
    this.processed.add(eventId);

    setTimeout(() => this.processed.delete(eventId), 60000);

    console.log(`📡 ${event} | ${eventId} | ${source}`);

    await addToQueue("plugin-tasks", {
      event,
      payload,
      source,
      eventId
    });
  }
}
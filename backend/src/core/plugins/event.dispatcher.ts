import { addToQueue } from "../queues/plugin.queue";
import { eventStore } from "./events/event.store";
import crypto from "crypto";

export class EventDispatcher {
  static async dispatch(event: any, source = "system") {

    const eventId = event?.meta?.eventId;

    if (!eventId) {
      console.error("🚨 Missing eventId");
      return;
    }

    console.log(`📡 ${event.type} | ${eventId} | ${source}`);

    await addToQueue("plugin-tasks", {
      type: event.type,
      data: event.data,
      context: event.context,
      meta: event.meta,
      source
    });
  }
}
import crypto from "crypto";
import { pluginQueue } from "../../queues/plugin.queue";
import { isValidPageUpdatedEvent } from "./contracts/pageUpdated.event";

export class EventBus {

  static async emit(event: string, payload: any) {

    const enrichedEvent = {
      type: event,

      data: payload.data ?? payload,

      context: payload.context ?? {},

      meta: {
        eventId: crypto.randomUUID(),
        timestamp: Date.now(),
        source: "event.bus"
      }
    };

    if (event === "page.updated") {
      if (!isValidPageUpdatedEvent(enrichedEvent)) {
        throw new Error("Invalid PageUpdatedEvent payload");
      }
    }

    console.log("📡 EMIT Event:", event);

    await pluginQueue.add("plugin-tasks", enrichedEvent);
  }
}

export const detectChanges = (oldData: any, newData: any): string[] => {
  const changes: string[] = [];

  const normalize = (data: any) =>
    JSON.stringify(data || {}, Object.keys(data || {}).sort());

  if (oldData.title !== newData.title) changes.push("title");
  if (oldData.content !== newData.content) changes.push("content");
  if (oldData.status !== newData.status) changes.push("status");

  if (normalize(oldData.blocks) !== normalize(newData.blocks)) {
    changes.push("blocks");
  }

  return changes;
};
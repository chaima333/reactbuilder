import { EventEmitter } from "events";
import { pluginQueue } from "../../queues/plugin.queue";
import { isValidPageUpdatedEvent } from "./contracts/pageUpdated.event";

class CentralBus extends EventEmitter {}



export class EventBus {
  // استعمل الـ pluginQueue المستورد مباشرة
  static async emit(event: string, payload: any) {
    
    if (event === "page.updated") {
      if (!isValidPageUpdatedEvent(payload)) {
        throw new Error("Invalid PageUpdatedEvent payload");
      }
    }

    console.log("📡 EMIT Event to Queue:", event);

    // ✅ استعمل pluginQueue هنا مباشرة
    await pluginQueue.add("plugin-tasks", {
      event,
      payload,
    });
  }
}

export const detectChanges = (oldData: any, newData: any): string[] => {
  const changes: string[] = [];

  const normalize = (data: any) => {
    if (!data) return "[]";
    return JSON.stringify(data, Object.keys(data).sort());
  };

  if (oldData.title !== newData.title) changes.push("title");
  if (oldData.content !== newData.content) changes.push("content");
  if (oldData.status !== newData.status) changes.push("status");

  if (normalize(oldData.blocks) !== normalize(newData.blocks)) {
    changes.push("blocks");
  }

  return changes;
};
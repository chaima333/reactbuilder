import crypto from "crypto";
import { pluginQueue } from "../../queues/plugin.queue";
import { eventStore } from "./event.store";
import { isValidUnifiedEvent, UnifiedEvent } from "./contracts/pageUpdated.event"; 

export class EventBus {
static async emit(type: string, payload: any) {
  const event: UnifiedEvent = {
    id: crypto.randomUUID(),
    type: type,
    timestamp: Date.now(),
    data: payload.data || payload, // السلعة
    context: payload.context       // شكون ومنين
  };

  console.log(`📡 [BUS] Dispatching → ${type} | ID: ${event.id}`);
  await pluginQueue.add("plugin-tasks", event);
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
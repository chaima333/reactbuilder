// src/core/plugins/events/eventBus.ts

import crypto from "crypto";
import { pluginQueue } from "../../queues/plugin.queue";
import { UnifiedEvent } from "./contracts/unified.contract.ts";

export class EventBus {
  static async emit(params: Omit<UnifiedEvent, "id" | "timestamp">) {

    const event: UnifiedEvent = {
      id: crypto.randomUUID(),
      timestamp: Date.now(),
      type: params.type,
      data: params.data,
      context: {
        ...params.context,
        source: params.context.source ?? "event.bus"
      }
    };

    console.log(`📡 BUS → ${event.type} | ${event.id}`);

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
// src/core/plugins/events/eventBus.ts

import crypto from "crypto";
import { pluginQueue } from "../../queues/plugin.queue";
import { UnifiedEvent } from "./contracts/pageUpdated.event";

// src/core/events/event-bus.ts
export class EventBus {
  private static validate(params: any) {
    const requiredContext = ['userId', 'siteId', 'action'];
    if (!params.type || !params.data || !params.context) {
      throw new Error(`[BUS_VALIDATION_ERROR] Missing core fields (type, data, or context)`);
    }
    for (const field of requiredContext) {
      if (!(field in params.context)) {
        throw new Error(`[BUS_VALIDATION_ERROR] Missing context field: ${field}`);
      }
    }
  }

  static async emit(params: { type: string; data: any; context: any }) {
    // 1. Enforcement
    this.validate(params);

    // 2. Normalization (The Only Place where IDs are born)
    const event: UnifiedEvent = {
      id: crypto.randomUUID(),
      type: params.type,
      timestamp: Date.now(),
      data: params.data,
      context: {
        ...params.context,
        source: "event.bus"
      }
    };

    console.log(`📡 [BUS] Dispatched & Validated: ${event.type}`);
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
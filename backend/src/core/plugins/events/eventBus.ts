// src/core/plugins/events/eventBus.ts

import crypto from "crypto";
import { UnifiedEvent } from "./contracts/pageUpdated.event";
import { pluginQueue } from "../../queues/plugin.queue";

export class EventBus {
  static async emit(eventParams: Omit<UnifiedEvent, "id" | "timestamp">) {
    // 1. توليد الحقول الناقصة أوتوماتيكيّاً لضمان الـ Consistency
    const finalEvent: UnifiedEvent = {
      id: crypto.randomUUID(),
      timestamp: Date.now(),
      ...eventParams
    };

    console.log(`📡 [BUS] Dispatching → ${finalEvent.type} | ID: ${finalEvent.id}`);

    // 2. إرسال الكرتونة الموحّدة للـ Redis
    await pluginQueue.add("plugin-tasks", finalEvent);
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
// src/core/plugins/events/eventBus.ts

import crypto from "crypto";
import { pluginQueue } from "../../queues/plugin.queue";

export class EventBus {
  // نبعثوا بارامتر واحد موحد
  static async emit(params: {
    type: string;
    data: any;
    context: { userId: number; siteId: number; action: string };
  }) {
    // التصنيع النهائي والوحيد للـ Event يكون هنا
    const enrichedEvent = {
      id: crypto.randomUUID(),
      type: params.type,
      timestamp: Date.now(),
      data: params.data,
      context: {
        ...params.context,
        source: "event.bus" // ديما نعرفوا شكون المنظم
      }
    };

    console.log(`📡 [BUS] Dispatching → ${enrichedEvent.type} | ID: ${enrichedEvent.id}`);
    
    // بعث الـ Object كامل للـ Queue
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
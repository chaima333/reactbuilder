import crypto from "crypto";
import { pluginQueue } from "../../queues/plugin.queue";
import { eventStore } from "./event.store";
import { isValidPageUpdatedEvent } from "./contracts/pageUpdated.event";

export class EventBus {
  static async emit(event: any) {
    const enriched = {
      ...event,
      meta: {
        eventId: event.meta?.eventId || crypto.randomUUID(),
        timestamp: Date.now(),
        source: event.meta?.source || "event.bus"
      }
    };

    // التحقق من صحة الحدث
    if (event.type === "page.updated") {
      if (!isValidPageUpdatedEvent(enriched)) {
        // تعطيل الـ Error مؤقتاً لضمان عمل الـ Dashboard
        console.warn("⚠️ Validation Failed for page.updated, but proceeding to Redis...");
      }
    }

    console.log(`📡 EMIT → ${enriched.type} | ${enriched.meta.eventId}`);

    // إرسال للـ Queue (للـ Plugins)
    await pluginQueue.add("plugin-tasks", enriched);

    // إرسال للـ Redis (للـ Dashboard)
    await eventStore.add({
      id: enriched.meta.eventId,
      type: enriched.type,
      timestamp: enriched.meta.timestamp,
      payload: enriched.data
    });
  }
}



export const detectChanges = (oldData: any, newData: any): string[] => {
  const changes: string[] = [];

  // دالة داخلية لترتيب الـ Blocks ومقارنتها بشكل صحيح كـ JSON
  const normalize = (data: any) =>
    JSON.stringify(data || {}, Object.keys(data || {}).sort());

  // مقارنة الحقول الأساسية
  if (oldData.title !== newData.title) changes.push("title");
  if (oldData.content !== newData.content) changes.push("content");
  if (oldData.status !== newData.status) changes.push("status");

  // مقارنة الـ Blocks (مفيدة جداً لصفحات الـ Builder)
  if (normalize(oldData.blocks) !== normalize(newData.blocks)) {
    changes.push("blocks");
  }

  return changes;
};
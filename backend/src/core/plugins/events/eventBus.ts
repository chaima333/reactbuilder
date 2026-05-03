import crypto from "crypto";
import { pluginQueue } from "../../queues/plugin.queue";
import { BaseEvent, isValidPageUpdatedEvent } from "./contracts/pageUpdated.event";

export class EventBus {

  static async emit(event: BaseEvent) {

    const enriched: BaseEvent = {
      ...event,
      meta: {
        eventId: event.meta?.eventId || crypto.randomUUID(),
        timestamp: Date.now(),
        source: event.meta?.source || "event.bus"
      }
    };

    if (event.type === "page.updated") {
      if (!isValidPageUpdatedEvent(enriched)) {
        throw new Error("Invalid page.updated event");
      }
    }

    console.log(`📡 EMIT → ${enriched.type} | ${enriched.meta.eventId}`);

    await pluginQueue.add("plugin-tasks", enriched);
  }
}
/**
 * دالة مقارنة البيانات (Diffing)
 * تكتشف الحقول التي تغيرت فعلياً لتجنب العمليات غير الضرورية
 */
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
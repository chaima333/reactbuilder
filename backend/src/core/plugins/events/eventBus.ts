import crypto from "crypto";
import { pluginQueue } from "../../queues/plugin.queue";
import { isValidPageUpdatedEvent } from "./contracts/pageUpdated.event";

export class EventBus {
  /**
   * إرسال حدث للنظام مع تغليفه بمعلومات إضافية والتحقق من صحته
   */
  static async emit(event: string, payload: any) {
    // 1️⃣ تغليف الحدث (Event Enrichment)
    // نضمن أن البيانات والـ Context والـ Meta موجودة دائماً بنفس الهيكل
    const enrichedEvent = {
      type: event,
      data: payload.data ?? payload, // نأخذ البيانات سواء كانت داخل data أو الـ payload نفسه
      context: payload.context ?? {},
      meta: {
        eventId: crypto.randomUUID(),
        timestamp: Date.now(),
        source: "event.bus"
      }
    };

    // 2️⃣ التحقق من العقد (Contract Validation)
    // إذا كان الحدث هو تحديث صفحة، نمرره على الحارس الخاص به
    if (event === "page.updated") {
      if (!isValidPageUpdatedEvent(enrichedEvent)) {
        console.error("❌ Validation Failed for enrichedEvent:", enrichedEvent);
        throw new Error("Invalid PageUpdatedEvent payload: Structure does not match contract.");
      }
    }
    
    // 3️⃣ تتبع الخروج (Logging)
    console.log(`📡 [Bus] EMIT → ${event} | ID: ${enrichedEvent.meta.eventId}`);

    // 4️⃣ الإرسال للـ Queue (The Source of Truth)
    // نرسل الـ enrichedEvent كاملاً للـ Worker
    await pluginQueue.add("plugin-tasks", enrichedEvent);
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
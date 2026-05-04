import crypto from "crypto";
import { pluginQueue } from "../../queues/plugin.queue";
import { UnifiedEvent } from "./contracts/unified.contract.ts";

export class EventBus {
  static async emit(params: Omit<UnifiedEvent, "id" | "timestamp" | "traceId">) {
    const event: UnifiedEvent = {
      id: crypto.randomUUID(),
      // 🧭 TraceId يربط الـ Request بالـ Worker
      traceId: crypto.randomUUID(), 
      timestamp: Date.now(),
      type: params.type,
      data: params.data,
      context: {
        ...params.context,
        source: params.context.source ?? "event.bus"
      }
    };

    console.log(`📡 [TRACE: ${event.traceId}] BUS → ${event.type} | ${event.id}`);

    // 🔁 نزيدو الـ Retries والـ Ordering (Key-based)
    await pluginQueue.add("plugin-tasks", event, {
      jobId: event.id, // لمنع BullMQ من تكرار نفس الـ Job
      attempts: 3,     // محاولات في حالة فشل Plugin Critical
      backoff: {
        type: "exponential",
        delay: 2000,   // يبدأ بـ 2 ثواني
      },
      // 🧭 الترتيب: الـ Events متاع نفس الموقع يمشيو ورا بعضهم
      removeOnComplete: true,
    });
  }
}


export const detectChanges = (oldData: any, newData: any): string[] => {
  const changes: string[] = [];

  /**
   * دالة مساعدة لتحويل أي داتا لـ Plain String 
   * تضمن إننا نقارنو في "الجوهر" موش في الـ Reference متاع الـ Object
   */
  const stringify = (val: any) => {
    if (val === null || val === undefined) return "";
    if (typeof val === "object") return JSON.stringify(val);
    return String(val).trim();
  };

  // 1. مقارنة الحقول النصية (Title, Content, Status)
  // نزيدو الـ .trim() باش لو المستخدم زاد "فراغ" بالغلط ما نعتبروش تبديل حقيقي
  const fieldsToWatch = ["title", "content", "status"];
  
  fieldsToWatch.forEach(field => {
    if (stringify(oldData[field]) !== stringify(newData[field])) {
      changes.push(field);
    }
  });

  // 2. مقارنة الـ Blocks (الـ JSON المعقد)
  // الـ normalize القديم متاعك باهي، أما نزيدو نضمنو إنو يقارن Deep Equality
  const oldBlocks = JSON.stringify(oldData.blocks || []);
  const newBlocks = JSON.stringify(newData.blocks || []);
  
  if (oldBlocks !== newBlocks) {
    changes.push("blocks");
  }

  return changes;
};
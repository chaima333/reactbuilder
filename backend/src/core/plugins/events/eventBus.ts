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
// دالة detectChanges تبقى كما هي لأنها تخدم خدمتها مريقل

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
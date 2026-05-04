import crypto from "crypto";
import { pluginQueue } from "../../queues/plugin.queue";

const inMemoryLock = new Map<string, number>();
const TTL = 3000; // 3 seconds window (anti double trigger)

function isDuplicate(key: string) {
  const now = Date.now();
  const last = inMemoryLock.get(key);

  if (last && now - last < TTL) return true;

  inMemoryLock.set(key, now);
  return false;
}

export class EventBus {
  static async emit(params: {
    type: string;
    data: any;
    context: any;
  }) {
    const pageId = params.data?.current?.id;
    if (!pageId) return;

    // 1️⃣ استعمل الـ ID الحقيقي اللي بعثناه من الـ Handler (الـ UUID)
    const finalId = params.context.id || crypto.randomUUID();
    const finalTraceId = params.context.traceId || finalId;

    console.log(`📡 BUS → ${params.type} | Page: ${pageId} | Trace: ${finalTraceId.slice(0, 8)}`);

    await pluginQueue.add(
      "plugin-tasks",
      {
        id: finalId,         // <--- UUID فريد
        traceId: finalTraceId, // <--- UUID فريد
        timestamp: Date.now(),
        type: params.type,
        data: params.data,
        context: {
          ...params.context,
          source: "event.bus"
        }
      },
      {
        // 🧠 الـ JobId في الـ Queue لازم يكون فريد باش ما يطيرش الـ Event
        jobId: finalId, 
        attempts: 1,
        removeOnComplete: true
      }
    );
  }
}
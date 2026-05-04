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

    if (!pageId) {
      console.log("🚫 missing pageId → event ignored");
      return;
    }

    // 🧠 stable operation key (NOT content)
    const baseKey = `${params.type}:${pageId}`;

    const dedupeKey = crypto
      .createHash("sha256")
      .update(baseKey)
      .digest("hex");

    // 🚫 FAST guard (same tick / double call protection)
    if (isDuplicate(dedupeKey)) {
      console.log("🟡 duplicate blocked (memory):", baseKey);
      return;
    }

    console.log(`📡 BUS → ${params.type} | ${pageId}`);

    await pluginQueue.add(
      "plugin-tasks",
      {
        id: dedupeKey,
        traceId: dedupeKey,
        timestamp: Date.now(),
        type: params.type,
        data: params.data,
        context: {
          ...params.context,
          source: "event.bus"
        }
      },
      {
        // 🧠 ONLY real protection at queue level
        jobId: dedupeKey,
        attempts: 1,
        removeOnComplete: true
      }
    );
  }
}
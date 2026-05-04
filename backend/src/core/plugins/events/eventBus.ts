import crypto from "crypto";
import { pluginQueue } from "../../queues/plugin.queue";
import { UnifiedEvent } from "./contracts/unified.contract.ts";

// 🧠 in-memory dedup (fast guard)
const emittedEvents = new Map<string, number>();
const TTL = 5000; // 5 seconds window

function isDuplicate(key: string) {
  const now = Date.now();
  const last = emittedEvents.get(key);

  if (last && now - last < TTL) return true;

  emittedEvents.set(key, now);
  return false;
}

export class EventBus {
  static async emit(params: {
    id?: string;
    traceId?: string;
    type: string;
    data: any;
    context: Omit<UnifiedEvent["context"], "source">;
  }) {

    const currentId = params.data?.current?.id;

    // 🔥 business key (IMPORTANT FIX)
    const eventKey = crypto.createHash("sha256")
      .update(JSON.stringify({
        type: params.type,
        id: currentId,
        slug: params.data?.current?.slug,
        title: params.data?.current?.title,
        changes: params.data?.changes || []
      }))
      .digest("hex");

    // 🛑 HARD dedup at bus level
    if (isDuplicate(eventKey)) {
      console.log("🟡 [EventBus] duplicate blocked:", eventKey);
      return;
    }

    const event: UnifiedEvent = {
      id: crypto.randomUUID(),
      traceId: eventKey, // 🔥 مهم: traceId = business key
      timestamp: Date.now(),
      type: params.type,
      data: params.data,
      context: {
        ...params.context,
        source: "event.bus"
      }
    };

    console.log(`📡 [TRACE: ${event.traceId}] BUS → ${event.type} | ${event.id}`);

    // 🔥 Queue dedup (PRIMARY protection)
   const dedupeKey = crypto
  .createHash("sha256")
  .update(JSON.stringify({
    type: event.type,
    id: event.data.current.id,
    title: event.data.current.title,
    slug: event.data.current.slug,
    blocks: event.data.current.blocks
  }))
  .digest("hex");

await pluginQueue.add("plugin-tasks", event, {
  jobId: dedupeKey,
  attempts: 3,
  backoff: { type: "exponential", delay: 2000 },
  removeOnComplete: true,
});
  }
}

//

export const detectChanges = (oldData: any, newData: any): string[] => {
  const changes: string[] = [];

 
  const stringify = (val: any) => {
    if (val === null || val === undefined) return "";
    if (typeof val === "object") return JSON.stringify(val);
    return String(val).trim();
  };

  const fieldsToWatch = ["title", "content", "status"];
  
  fieldsToWatch.forEach(field => {
    if (stringify(oldData[field]) !== stringify(newData[field])) {
      changes.push(field);
    }
  });

  const oldBlocks = JSON.stringify(oldData.blocks || []);
  const newBlocks = JSON.stringify(newData.blocks || []);
  
  if (oldBlocks !== newBlocks) {
    changes.push("blocks");
  }

  return changes;
};
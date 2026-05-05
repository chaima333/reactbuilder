import crypto from "crypto";
import { pluginQueue } from "../../queues/plugin.queue";
import { safeEvent } from "./contracts/event.safe";
export class EventBus {
  static async emit(params: any) {

    const safe = safeEvent(params);
    if (!safe) {
      console.warn("❌ Dropped invalid event in EventBus");
      return;
    }

    const pageId = safe.data.current.id;

    const jobId = crypto.createHash("sha256")
      .update(`${params.type}:${pageId}:${safe.context.traceId || ""}`)
      .digest("hex");

    await pluginQueue.add(
      "plugin-tasks",
      {
        id: jobId,
        traceId: safe.context.traceId || jobId,
        timestamp: Date.now(),
        type: params.type,
        data: safe.data,
        context: {
          ...safe.context,
          source: safe.context.source || "event.bus",
          depth: safe.context.depth + 1
        }
      },
      {
        jobId,
        attempts: 1,
        removeOnComplete: true
      }
    );
  }
}

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
import crypto from "crypto";
import { pluginQueue } from "../../queues/plugin.queue";
import { UnifiedEvent } from "./contracts/unified.contract.ts";


export class EventBus {
  static async emit(params: {
    type: string;
    data: any;
    context: any;
  }) {
    const pageId = params.data?.current?.id;
    if (!pageId) return;

    const finalId = params.context.id || crypto.randomUUID();
    const finalTraceId = params.context.traceId || finalId;

    console.log(`📡 BUS → ${params.type} | Page: ${pageId} | Trace: ${finalTraceId.slice(0, 8)}`);

    await pluginQueue.add(
      "plugin-tasks",
      {
        id: finalId,
        traceId: finalTraceId,
        timestamp: Date.now(),
        type: params.type,
        data: params.data,
        context: {
          ...params.context,
          // ✅ إذا المصدر موجود (page.handler) خليه، إذا مش موجود حط event.bus
          source: params.context.source || "event.bus" 
        }
      },
      {
        jobId: finalId, 
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
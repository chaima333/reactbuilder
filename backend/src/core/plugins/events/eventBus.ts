import crypto from "crypto";
import { pluginQueue } from "../../queues/plugin.queue";
import { UnifiedEvent } from "./contracts/unified.contract.ts";

// src/core/plugins/events/eventBus.ts

export class EventBus {
  static async emit(params: {
    id?: string;      
    traceId?: string;
    type: string;
    data: any;
    context: Omit<UnifiedEvent["context"], "source">; // نطلب الكونتكس بدون سورس هنا
  }) {
    // بناء الحدث النهائي مع الالتزام بالـ UnifiedEvent Interface
    const event: UnifiedEvent = {
      id: crypto.randomUUID(),
      traceId: crypto.randomUUID(),
      timestamp: Date.now(),
      type: params.type,
      data: params.data,
      context: {
        ...params.context,
        source: "event.bus" // الـ Bus يضيف السورس هنا لإرضاء الـ Interface
      }
    };

    console.log(`📡 [TRACE: ${event.traceId}] BUS → ${event.type} | ${event.id}`);

    await pluginQueue.add("plugin-tasks", event, {
      jobId: event.id,
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
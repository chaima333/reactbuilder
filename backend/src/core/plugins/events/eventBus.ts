import crypto from "crypto";
import { pluginQueue } from "../../queues/plugin.queue";

export class EventBus {
  static async emit(params: {
    type: string;
    data: any;
    context: any;
  }) {

    const pageId = params.data?.current?.id;
    if (!pageId) return;

    // 🔒 identity ثابت (ممنوع يعتمد على content)
    const jobId = crypto.createHash("sha256")
      .update(`${params.type}:${pageId}:${params.context.traceId}`)
      .digest("hex");

    console.log(`📡 BUS → ${params.type} | Page: ${pageId}`);

    await pluginQueue.add(
      "plugin-tasks",
      {
        id: jobId,
        traceId: params.context.traceId || jobId,
        timestamp: Date.now(),
        type: params.type,
        data: params.data,
        context: {
          ...params.context,
          source: params.context.source || "event.bus",
          depth: (params.context.depth || 0) + 1
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
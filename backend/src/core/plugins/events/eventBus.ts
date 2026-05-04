import crypto from "crypto";
import { pluginQueue } from "../../queues/plugin.queue";

export class EventBus {
  static async emit(params: {
    type: string;
    data: any;
    context: any;
  }) {

    const pageId = params.data?.current?.id;

    // 🔥 ONLY stable identity = operation, not content
    const dedupeKey = crypto
      .createHash("sha256")
      .update(`${params.type}:${pageId}`)
      .digest("hex");

    console.log(`📡 BUS → ${params.type} | ${pageId}`);

    await pluginQueue.add("plugin-tasks", {
      id: dedupeKey,
      traceId: dedupeKey,
      timestamp: Date.now(),
      type: params.type,
      data: params.data,
      context: {
        ...params.context,
        source: "event.bus"
      }
    }, {
      jobId: dedupeKey,
      attempts: 1,
      removeOnComplete: true
    });
  }
}
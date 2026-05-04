import crypto from "crypto";
import { pluginQueue } from "../../queues/plugin.queue";
import { UnifiedEvent } from "./contracts/unified.contract.ts";

export class EventBus {
  static async emit(params: {
    type: string;
    data: any;
    context: Omit<UnifiedEvent["context"], "source">;
  }) {

    const pageId = params.data?.current?.id;

    // 🔥 BASE KEY = operation identity only
    const dedupeKey = crypto
      .createHash("sha256")
      .update(JSON.stringify({
        type: params.type,
        pageId
      }))
      .digest("hex");

    const event: UnifiedEvent = {
      id: dedupeKey,
      traceId: dedupeKey,
      timestamp: Date.now(),
      type: params.type,
      data: params.data,
      context: {
        ...params.context,
        source: "event.bus"
      }
    };

    console.log(`📡 BUS → ${event.type} | ${dedupeKey}`);

    await pluginQueue.add("plugin-tasks", event, {
      jobId: dedupeKey,
      attempts: 1, // 🔥 مهم: stop retry duplication
      removeOnComplete: true
    });
  }
}
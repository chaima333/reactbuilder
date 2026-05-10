// core/queues/plugin.queue.ts
import { Queue } from "bullmq";
import { redis  } from "../cache/config";

export const pluginQueue = new Queue("plugin-tasks", {
  connection: redis 
});

// أضفنا الـ return ونوعنا الـ Parameters باش تمشي مع الـ Dispatcher
export const addToQueue = async (queueName: string, data: any) => {
  // نرجعو الـ Promise متاع الـ add باش الـ Dispatcher ينجم يعمل عليه Check
  return await pluginQueue.add("plugin-event", data, {
    attempts: 3,
    backoff: { type: "exponential", delay: 2000 }
  });
};
// core/queues/plugin.queue.ts
import { Queue } from "bullmq";
import { REDIS_CONFIG } from "./config";

export const pluginQueue = new Queue("plugin-tasks", {
  connection: REDIS_CONFIG
});

export const addToQueue = async (event: string, payload: any) => {
  await pluginQueue.add("plugin-event", {
    event,
    payload
  }, {
    attempts: 3,
    backoff: { type: "exponential", delay: 2000 }
  });
};
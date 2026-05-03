// src/core/queues/plugin.worker.ts
import { Worker } from "bullmq";
import { cmsRegistry } from "../plugins/plugin.registry";
import { REDIS_CONFIG, redis } from "./config"; 
import { PageUpdateData, UnifiedEvent, validateEvent } from "../plugins/events/contracts/unified.contract.ts";

const HISTORY_KEY = "dashboard:runtime:events";
const DLQ_KEY = "dashboard:dead:letters";

export const initPluginWorker = () =>
  new Worker(
    "plugin-tasks",
    async (job) => {
      const event = job.data as UnifiedEvent;

      const validation = validateEvent(event);

      if (!validation.isValid) {
        console.error("☢️ REJECTED:", validation.error);

        await redis.lpush(
          DLQ_KEY,
          JSON.stringify({ event, error: validation.error })
        );

        return;
      }

      console.log(`📦 WORKER: ${event.type} | ${event.id}`);

      const plugins = cmsRegistry
        .getAllPlugins()
        .filter(
          (p) => p.enabled && p.events.includes(event.type)
        );

      for (const plugin of plugins) {
        try {
          await plugin.execute(event);
        } catch (err) {
          console.error(`Plugin failed: ${plugin.name}`, err);
          if (plugin.isCritical) throw err;
        }
      }

      await redis.lpush(HISTORY_KEY, JSON.stringify(event));
      await redis.ltrim(HISTORY_KEY, 0, 49);

      console.log(`💾 Persisted: ${event.id}`);
    },
    { connection: REDIS_CONFIG }
  );
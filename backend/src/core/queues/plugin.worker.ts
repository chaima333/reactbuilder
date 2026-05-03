// src/core/queues/plugin.worker.ts
import { Worker } from "bullmq";
import { cmsRegistry } from "../plugins/plugin.registry";
import { REDIS_CONFIG, redis } from "./config"; // 🔥 استوردنا الـ redis instance
import { UnifiedEvent } from "../../core/plugins/events/contracts/pageUpdated.event";

export const initPluginWorker = () =>
  new Worker(
    "plugin-tasks",
    async (job) => {
      const event = job.data as UnifiedEvent;
      await redis.set("DEBUG_WORKER_STATUS", `Last ID: ${event.id} at ${new Date().toISOString()}`);
      if (!event || !event.type) return;

      console.log(`📦 [WORKER] Processing: ${event.type} | ID: ${event.id}`);

      // 1. تنفيذ الـ Plugins
      const activePlugins = cmsRegistry.getAllPlugins()
        .filter(p => p.enabled && p.events.includes(event.type));

      for (const plugin of activePlugins) {
        try {
          console.log(`⚙️  Executing: ${plugin.name}`);
          await plugin.execute(event);
          console.log(`✅ [${plugin.name}] Success`);
        } catch (err) {
          console.error(`🚨 [Plugin Error] ${plugin.name} failed:`, err);
        }
      }

      // 2. 🔥 السطر السحري: تسجيل الـ Event في تاريخ الـ Dashboard
      try {
        const HISTORY_KEY = "dashboard:runtime:events";
        await redis.lpush(HISTORY_KEY, JSON.stringify(event)); 
        await redis.ltrim(HISTORY_KEY, 0, 49); // نخليوا كان آخر 50
        console.log(`💾 [WORKER] Event ${event.id} persisted to Redis.`);
      } catch (redisErr) {
        console.error("❌ Redis persistence error:", redisErr);
      }
    },
    { connection: REDIS_CONFIG }
  );
import { Worker } from "bullmq";
import { cmsRegistry } from "../plugins/plugin.registry";
import { REDIS_CONFIG, redis } from "./config"; // استورد الـ redis instance اللي عملنا فيها flushall
import { UnifiedEvent } from "../../core/plugins/events/contracts/pageUpdated.event";

export const initPluginWorker = () =>
  new Worker(
    "plugin-tasks",
    async (job) => {
      const event = job.data as UnifiedEvent;

      if (!event || !event.type) {
        console.error(`❌ [WORKER] Data corrupted for job ${job.id}`);
        return;
      }

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

      // 2. 🔥 الـ Missing Piece: حفظ الـ Event في الـ Dashboard History
      try {
        const HISTORY_KEY = "dashboard:runtime:events";
        
        // نزيدو الـ Event في أول القائمة (LPUSH)
        await redis.lpush(HISTORY_KEY, JSON.stringify(event));
        
        // ✂️ اختياري: نخليوا كان آخر 50 Event باش ما نعبّيوش الـ Memory
        await redis.ltrim(HISTORY_KEY, 0, 49);
        
        console.log(`💾 [WORKER] Event ${event.id} persisted to Dashboard History.`);
      } catch (redisErr) {
        console.error("❌ [WORKER] Failed to save event to Redis history:", redisErr);
      }
    },
    { connection: REDIS_CONFIG }
  );
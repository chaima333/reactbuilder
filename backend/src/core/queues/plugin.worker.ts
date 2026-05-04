import { Worker } from "bullmq";
import { cmsRegistry } from "../plugins/plugin.registry";
import { REDIS_CONFIG, redis } from "./config"; 
import { UnifiedEvent, validateEvent } from "../plugins/events/contracts/unified.contract.ts";

const HISTORY_KEY = "dashboard:runtime:events";
const DLQ_KEY = "dashboard:dead:letters";

export const initPluginWorker = () => {
  const worker = new Worker(
    "plugin-tasks",
    async (job) => {
      const rawEvent = JSON.parse(JSON.stringify(job.data)) as UnifiedEvent;

      // 1. Validation
      const validation = validateEvent(rawEvent);
      if (!validation.isValid) {
        await redis.lpush(DLQ_KEY, JSON.stringify({ event: rawEvent, error: validation.error }));
        return;
      }

      // 2. Idempotency (Lock لـ 10 ثواني تكفي للتجربة)
      const lockKey = `evt:done:${rawEvent.id}`;
      const isFirstTime = await redis.set(lockKey, "1", "PX", 10000, "NX");
      if (!isFirstTime) return;

      console.log(`📦 [TRACE: ${rawEvent.traceId}] Processing event...`);

      // 3. تنفيذ الـ Plugins
      const plugins = cmsRegistry
        .getAllPlugins()
        .filter((p) => p.enabled && p.events.includes(rawEvent.type));

      for (const plugin of plugins) {
        try {
          await plugin.execute(JSON.parse(JSON.stringify(rawEvent)));
        } catch (err: any) {
          console.error(`🚨 [Plugin Error] ${plugin.name}:`, err.message);
        }
      }

      // 4. 🔥 الـ Atomic Persistence (السر في الـ Pipeline)
      try {
        const pipeline = redis.multi();
        pipeline.lpush(HISTORY_KEY, JSON.stringify(rawEvent));
        pipeline.ltrim(HISTORY_KEY, 0, 49);
        pipeline.llen(HISTORY_KEY); // باش نعرفو الحجم الجديد
        
        const results = await pipeline.exec();
        const newListSize = results ? results[2][1] : 0;

        console.log(`💾 [SUCCESS] TraceId: ${rawEvent.traceId} | History Size: ${newListSize}`);
      } catch (persistErr) {
        console.error("❌ Persistence Error:", persistErr);
      }
    },
    { 
      connection: REDIS_CONFIG,
      concurrency: 5 
    }
  );

  worker.on("failed", (job, err) => {
    console.error(`☢️ [FATAL] Job ${job?.id} failed:`, err.message);
  });

  return worker;
};
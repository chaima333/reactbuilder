// src/core/queues/plugin.worker.ts
import { Worker } from "bullmq";
import { cmsRegistry } from "../plugins/plugin.registry";
import { REDIS_CONFIG, redis } from "./config"; 
import { UnifiedEvent, validateEvent } from "../plugins/events/contracts/unified.contract.ts";

const HISTORY_KEY = "dashboard:runtime:events";
const DLQ_KEY = "dashboard:dead:letters";

// ❄️ Helper لـ تجميد الـ Event (Immutability)
function deepFreeze(obj: any) {
  Object.freeze(obj);
  Object.getOwnPropertyNames(obj).forEach((prop) => {
    if (obj[prop] !== null && (typeof obj[prop] === "object") && !Object.isFrozen(obj[prop])) {
      deepFreeze(obj[prop]);
    }
  });
  return obj;
}

export const initPluginWorker = () => {
  const worker = new Worker(
    "plugin-tasks",
    async (job) => {
      const event = job.data as UnifiedEvent;
      const validation = validateEvent(event);

      if (!validation.isValid) {
        await redis.lpush(DLQ_KEY, JSON.stringify({ event, error: validation.error }));
        return;
      }

      // 🛡️ 1. Idempotency (تمنع التنفيذ المكرر في Redis)
      const lockKey = `evt:done:${event.id}`;
      const isFirstTime = await redis.set(lockKey, "1", "PX", 3600000, "NX");
      if (!isFirstTime) {
        console.log(`⏭️ [SKIP] Duplicate Event: ${event.id}`);
        return;
      }

      console.log(`📦 [TRACE: ${event.traceId}] WORKER: ${event.type}`);

      // ❄️ 2. Immutability (تجميد الـ Event قبل ما ياخذوه الـ Plugins)
      // نأخذ نسخة عميقة ونجمدوها
      const frozenEvent = deepFreeze(JSON.parse(JSON.stringify(event)));

      const plugins = cmsRegistry
        .getAllPlugins()
        .filter((p) => p.enabled && p.events.includes(event.type));

      for (const plugin of plugins) {
        try {
          // الـ Plugins توة يخدموا بالنسخة المجمدة
          await plugin.execute(frozenEvent);
        } catch (err) {
          console.error(`🚨 Plugin failed: ${plugin.name}`, err);
          if (plugin.isCritical) throw err; // BullMQ سيقوم بالـ Retry هنا
        }
      }

      // 3. Persistence (تخزين النسخة الأصلية النظيفة)
      await redis.lpush(HISTORY_KEY, JSON.stringify(event));
      await redis.ltrim(HISTORY_KEY, 0, 49);

      console.log(`💾 [SUCCESS] Persisted: ${event.id}`);
    },
    { connection: REDIS_CONFIG }
  );

  // 🔁 4. Dead Letter Queue (DLQ) في حالة الفشل النهائي بعد 3 محاولات
  worker.on("failed", async (job, err) => {
    console.error(`☢️ [FATAL] Job ${job?.id} failed definitely:`, err.message);
    await redis.lpush(DLQ_KEY, JSON.stringify({
      jobId: job?.id,
      event: job?.data,
      error: err.message,
      failedAt: new Date().toISOString()
    }));
  });

  return worker;
};
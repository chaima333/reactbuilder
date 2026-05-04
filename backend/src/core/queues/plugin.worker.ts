// src/core/queues/plugin.worker.ts
import { Worker } from "bullmq";
import { cmsRegistry } from "../plugins/plugin.registry";
import { REDIS_CONFIG, redis } from "./config"; 
import { UnifiedEvent, validateEvent } from "../plugins/events/contracts/unified.contract.ts";

const HISTORY_KEY = "dashboard:runtime:events";
const DLQ_KEY = "dashboard:dead:letters";

/**
 * 🛠️ الـ Worker المسؤول عن تنفيذ الـ Plugins وتخزين التاريخ
 */
export const initPluginWorker = () => {
  const worker = new Worker(
    "plugin-tasks",
    async (job) => {
      // 1️⃣ أخذ نسخة مستقلة تماماً (Deep Copy) في أول خطوة
      // هذا يضمن إنو الـ rawEvent هو المرجع الصحيح متاعنا وما يتبدلش بالـ Reference
      const rawEvent = JSON.parse(JSON.stringify(job.data)) as UnifiedEvent;

      // 2️⃣ التثبت من صحة الـ Event حسب الـ Contract
      const validation = validateEvent(rawEvent);
      if (!validation.isValid) {
        console.error(`❌ [INVALID EVENT] ID: ${rawEvent.id}`, validation.error);
        await redis.lpush(DLQ_KEY, JSON.stringify({ event: rawEvent, error: validation.error }));
        return;
      }

      // 3️⃣ الـ Idempotency: منع تنفيذ نفس الـ Event أكثر من مرة (حماية للـ Redis والـ DB)
      const lockKey = `evt:done:${rawEvent.id}`;
      const isFirstTime = await redis.set(lockKey, "1", "PX", 3600000, "NX"); // Lock لمدة ساعة
      if (!isFirstTime) {
        console.log(`⏭️ [SKIP] Duplicate Event detected: ${rawEvent.id}`);
        return;
      }

      console.log(`📦 [TRACE: ${rawEvent.traceId}] WORKER: ${rawEvent.type} | ID: ${rawEvent.id}`);

      // 4️⃣ جلب الـ Plugins المهتمة بهذا النوع من الـ Events
      const plugins = cmsRegistry
        .getAllPlugins()
        .filter((p) => p.enabled && p.events.includes(rawEvent.type));

      // 5️⃣ تنفيذ الـ Plugins بالتوازي أو بالتوالي (حسب الـ mode)
      for (const plugin of plugins) {
        try {
          // 🛡️ حماية: نبعث نسخة (Clone) لكل بلجن
          // هكا نضمنوا إنو حتى لو البلجن عدّل في الداتا، الـ rawEvent يقعد نظيف
          const eventForPlugin = JSON.parse(JSON.stringify(rawEvent));
          
          console.log(`🔌 [Plugin: ${plugin.name}] Executing...`);
          await plugin.execute(eventForPlugin);
        } catch (err: any) {
          console.error(`🚨 [Plugin Error] ${plugin.name} failed:`, err.message);
          // إذا كان البلجن Critical، تنجم تزيد Logic هوني باش تمركي الـ Job كـ Failed
        }
      }

      // 6️⃣ الـ Persistence: تخزين النسخة الأصلية المحمية في Redis
      // الـ rawEvent هوني فيه الـ current والـ previous والـ changes كما خرجوا من الـ Handler
      await redis.lpush(HISTORY_KEY, JSON.stringify(rawEvent));
      
      // نخلوا كان آخر 50 Event باش ما نعبيوش الـ RAM متاع Redis
      await redis.ltrim(HISTORY_KEY, 0, 49);

      console.log(`💾 [SUCCESS] Event persisted to history: ${rawEvent.id}`);
    },
    { 
      connection: REDIS_CONFIG,
      concurrency: 5 // تنفيذ 5 مهام في نفس الوقت لزيادة السرعة
    }
  );

  // 7️⃣ التعامل مع الفشل النهائي (بعد الـ Retries الكل)
  worker.on("failed", async (job, err) => {
    console.error(`☢️ [FATAL] Job ${job?.id} failed definitely:`, err.message);
    await redis.lpush(DLQ_KEY, JSON.stringify({
      jobId: job?.id,
      event: job?.data,
      error: err.message,
      failedAt: new Date().toISOString()
    }));
  });

  console.log("🚀 Plugin Worker initialized and listening...");
  return worker;
};
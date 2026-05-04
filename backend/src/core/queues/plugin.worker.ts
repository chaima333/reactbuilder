import { Worker } from "bullmq";
import { cmsRegistry } from "../plugins/plugin.registry";
import { REDIS_CONFIG, redis } from "./config"; 
import { UnifiedEvent, validateEvent } from "../plugins/events/contracts/unified.contract.ts";

/**
 * 🔑 مفاتيح Redis المنظمة
 */
const GLOBAL_HISTORY_KEY = "dashboard:runtime:events";
const getSiteHistoryKey = (siteId: string | number) => `dashboard:events:site:${siteId}`;
const DLQ_KEY = "dashboard:dead:letters";

/**
 * 🛠️ الـ Worker المسؤول عن تنفيذ الـ Plugins وتخزين تاريخ الأحداث
 */
export const initPluginWorker = () => {
  const worker = new Worker(
    "plugin-tasks",
    async (job) => {
      // 1️⃣ استنساخ الحدث لضمان عدم تغيير البيانات الأصلية
      const rawEvent = JSON.parse(JSON.stringify(job.data)) as UnifiedEvent;

      // 2️⃣ التثبت من صحة الـ Event حسب الـ Contract
      const validation = validateEvent(rawEvent);
      if (!validation.isValid) {
        console.error(`❌ [INVALID EVENT] ID: ${rawEvent.id}`, validation.error);
        await redis.lpush(DLQ_KEY, JSON.stringify({ event: rawEvent, error: validation.error }));
        return;
      }

      // 3️⃣ الـ Idempotency: منع التكرار (Lock لمدة 10 ثواني)
      const lockKey = `evt:done:${rawEvent.id}`;
      const isFirstTime = await redis.set(lockKey, "1", "PX", 10000, "NX");
      if (!isFirstTime) {
        console.log(`⏭️ [SKIP] Duplicate Event: ${rawEvent.id}`);
        return;
      }

      console.log(`📦 [TRACE: ${rawEvent.traceId}] Processing: ${rawEvent.type}`);

      // 4️⃣ تنفيذ الـ Plugins المفعلة لهذا النوع من الأحداث
      const plugins = cmsRegistry
        .getAllPlugins()
        .filter((p) => p.enabled && p.events.includes(rawEvent.type));

      for (const plugin of plugins) {
        try {
          // نبعث نسخة مستقلة لكل بلجن
          const eventForPlugin = JSON.parse(JSON.stringify(rawEvent));
          await plugin.execute(eventForPlugin);
        } catch (err: any) {
          console.error(`🚨 [Plugin Error] ${plugin.name} failed:`, err.message);
        }
      }

      // 5️⃣ 🔥 الـ Atomic Persistence (التخزين الذكي)
      try {
        const siteId = rawEvent.data.current?.siteId || "global";
        const SITE_HISTORY_KEY = getSiteHistoryKey(siteId);

        // استعمال Pipeline لضمان تنفيذ كل العمليات مع بعضها
        const pipeline = redis.multi();

        // أ) الحفظ في الـ Key الخاص بالموقع (للـ Analytics)
        pipeline.lpush(SITE_HISTORY_KEY, JSON.stringify(rawEvent));
        pipeline.ltrim(SITE_HISTORY_KEY, 0, 99); // حفظ آخر 100 حدث للموقع

        // ب) الحفظ في الـ Key العام (لشاشة الـ Dashboard الرئيسية)
        pipeline.lpush(GLOBAL_HISTORY_KEY, JSON.stringify(rawEvent));
        pipeline.ltrim(GLOBAL_HISTORY_KEY, 0, 99); 

        // ج) الحصول على الحجم الجديد للتأكد من التراكم (Observability)
        pipeline.llen(SITE_HISTORY_KEY);

        const results = await pipeline.exec();
        
        // نتائج الـ exec تكون مصفوفة، الـ llen هو العنصر الأخير
        // في ioredis، النتيجة تكون [error, value]
        const newListSize = results ? (results[results.length - 1][1] as number) : 0;

        console.log(`💾 [SUCCESS] Site: ${siteId} | History Size: ${newListSize} | Trace: ${rawEvent.traceId}`);
      } catch (persistErr) {
        console.error("❌ Persistence Error:", persistErr);
      }
    },
    { 
      connection: REDIS_CONFIG,
      concurrency: 5 // معالجة 5 أحداث بالتوازي
    }
  );

  // 6️⃣ التعامل مع حالات الفشل النهائي
  worker.on("failed", async (job, err) => {
    console.error(`☢️ [FATAL] Job ${job?.id} failed:`, err.message);
    await redis.lpush(DLQ_KEY, JSON.stringify({
      jobId: job?.id,
      error: err.message,
      timestamp: new Date().toISOString()
    }));
  });

  console.log("🚀 Plugin Worker is LIVE and tracking history.");
  return worker;
};
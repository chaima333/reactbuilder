// src/core/queues/plugin.worker.ts
import { Worker } from "bullmq";
import { cmsRegistry } from "../plugins/plugin.registry";
import { REDIS_CONFIG, redis } from "./config"; 
import { PageUpdateData, UnifiedEvent, validateEvent } from "../../core/plugins/events/contracts/pageUpdated.event";

// مفاتيح موحدة لضمان عدم التشتت
const HISTORY_KEY = "dashboard:runtime:events";
const DLQ_KEY = "dashboard:dead:letters"; // صندوق الأحداث التالفة

export const initPluginWorker = () =>
  new Worker(
    "plugin-tasks",
   // داخل الـ Worker
async (job) => {
  const event = job.data;
  const validation = validateEvent(event);

  if (!validation.isValid) {
    console.error(`☢️ [REJECTED] Job ${job.id} | Reason: ${validation.error}`);
    // نبعثوه للـ Dead Letter Queue باش نصلحو الـ Bug اللي بعثه
    await redis.lpush("dashboard:dead:letters", JSON.stringify({ job: job.id, event, error: validation.error }));
    return;
  }

  //const validEvent = event as UnifiedEvent<PageUpdateData>;


      console.log(`📦 [WORKER] Start: ${event.type} | ID: ${event.id}`);

      // 2. Execution Stage (Plugins)
      const activePlugins = cmsRegistry.getAllPlugins()
        .filter(p => p.enabled && p.events.includes(event.type));

      for (const plugin of activePlugins) {
        try {
          console.log(`⚙️  Executing: ${plugin.name}`);
          // ملاحظة: الـ Plugins لازم ما يمسوش الـ Reference الأصلي متاع الـ event
          await plugin.execute(event);
          console.log(`✅ [${plugin.name}] Success`);
        } catch (err) {
          console.error(`🚨 [Plugin Error] ${plugin.name} failed:`, err);
          // إذا كان الـ Plugin حيوي (Critical)، نوقف الـ Job ونخلي BullMQ يعاودها
          if (plugin.isCritical) throw err; 
        }
      }

      // 3. Final Integrity Check & Persistence
      // نثبتوا إنو حتى Plugin ما "عفس" في الـ data ورجعها null مثلاً
      if (event.data && typeof event.data === 'object') {
        try {
          // تسجيل الحدث كـ "الحقيقة الوحيدة" المتبقية
          await redis.lpush(HISTORY_KEY, JSON.stringify(event)); 
          await redis.ltrim(HISTORY_KEY, 0, 49);
          
          console.log(`💾 [SUCCESS] Event ${event.id} committed to Dashboard.`);
        } catch (redisErr) {
          console.error("❌ [REDIS_FATAL] Could not save history:", redisErr);
        }
      } else {
        console.error(`☢️ [CRITICAL] Event ${event.id} data was destroyed during processing!`);
        await redis.lpush(DLQ_KEY, JSON.stringify({ ...event, error: "Data post-processing corruption" }));
      }
    },
    { 
      connection: REDIS_CONFIG,
      removeOnComplete: { count: 100 }, // تنظيف الـ BullMQ Jobs القديمة
      removeOnFail: { count: 500 }
    }
  );
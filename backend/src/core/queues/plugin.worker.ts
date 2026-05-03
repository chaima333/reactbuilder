import { Worker } from "bullmq";
import { cmsRegistry } from "../plugins/plugin.registry";
import { REDIS_CONFIG } from "./config";
import { UnifiedEvent } from "../../core/plugins/events/contracts/pageUpdated.event"; // استورد النوع الموحد

export const initPluginWorker = () =>
  new Worker(
    "plugin-tasks",

async (job) => {
  // 1. التثبت من البيانات (Safe Casting)
  const event = job.data as UnifiedEvent;
  
  if (!event || !event.type) {
    console.error(`❌ [WORKER] Data corrupted for job ${job.id}`);
    return;
  }

  console.log(`📦 [WORKER] Processing Event: ${event.type} | ID: ${event.id}`);

  // 2. فلطرة الـ Plugins النشطة
  const activePlugins = cmsRegistry.getAllPlugins()
    .filter(p => p.enabled && p.events.includes(event.type));

  // 3. التنفيذ مع الحماية (Error Isolation)
  for (const plugin of activePlugins) {
    try {
      console.log(`⚙️  Executing: ${plugin.name}`);
      
      // نبعثوا الـ Object الموحد
      await plugin.execute(event); 

      console.log(`✅ [${plugin.name}] Success`);
    } catch (err) {
      // لو Plugin يغلط، الـ Worker يقعد يخدم وما ياقفش
      console.error(`🚨 [Plugin Error] ${plugin.name} failed:`, err);
      
      // تنجم تزيد هوني منطق الـ "isCritical"
      if (plugin.isCritical) {
        throw err; // يخلي BullMQ يعاود الـ Job (Retry)
      }
    }
  }
},
    { connection: REDIS_CONFIG }
  );
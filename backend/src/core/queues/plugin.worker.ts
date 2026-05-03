import { Worker } from "bullmq";
import { cmsRegistry } from "../plugins/plugin.registry";
import { REDIS_CONFIG } from "./config";
import { UnifiedEvent } from "../../core/plugins/events/contracts/pageUpdated.event"; // استورد النوع الموحد

export const initPluginWorker = () =>
  new Worker(
    "plugin-tasks",
    async (job) => {
      // 1. استلام الحدث الموحد مباشرة من الـ Job
      const event = job.data as UnifiedEvent;

      console.log(`-----------------------------------------`);
      console.log(`📦 ÉVÉNEMENT REÇU → ${event.type} | ID: ${event.id}`);

      if (!event.type) {
        console.error("❌ Worker Error: Job data is missing 'type'.", job.data);
        return;
      }

      // 2. تصفية وترتيب الـ Plugins
      const plugins = cmsRegistry
        .getAllPlugins()
        .filter(p => p.enabled && p.events.includes(event.type))
        .sort((a, b) => (b.priority ?? 0) - (a.priority ?? 0));

      // 3. تشغيل الـ Pipeline
      let pipelineFailed = false;

      for (const plugin of plugins) {
        if (pipelineFailed) break;
        
        try {
          console.log(`⚙️ Executing Plugin: ${plugin.name}`);
          
          // ✅ التعديل الجوهري: نمرر الـ event كاملاً فقط
          await plugin.execute(event); 

        } catch (err: any) {
          console.error(`❌ Plugin [${plugin.name}] failed:`, err.message);
          // إذا كان الـ plugin حرجاً، نوقف الـ pipeline
          if (plugin.isCritical) pipelineFailed = true;
        }
      }
      
      console.log("📊 PIPELINE DONE");
    },
    { connection: REDIS_CONFIG }
  );
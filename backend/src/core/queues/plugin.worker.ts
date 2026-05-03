import { Worker } from "bullmq";
import { cmsRegistry } from "../plugins/plugin.registry";
import { REDIS_CONFIG } from "./config";

// core/queues/plugin.worker.ts
export const initPluginWorker = () =>
  new Worker(
    "plugin-tasks",
    async (job) => {
      // فك التغليف بناءً على ما أرسله الـ Dispatcher
      const { type, data, context, meta } = job.data;

      console.log(`-----------------------------------------`);
      console.log(`📦 ÉVÉNEMENT REÇU → ${type} | ID: ${meta?.eventId || 'N/A'}`);

      if (!type) {
        console.error("❌ Worker Error: Job data is missing 'type'. Data received:", job.data);
        return;
      }

      const plugins = cmsRegistry
        .getAllPlugins()
        .filter(p => p.enabled && p.events.includes(type))
        .sort((a, b) => (b.priority ?? 0) - (a.priority ?? 0));

      // تحضير السياق للـ Plugins (نستخدم الاسم payload داخلياً للـ plugins)
      const pipelineContext = {
        event: type,
        payload: data, 
        context: context,
        meta: meta,
        failed: false
      };

      for (const plugin of plugins) {
        if (pipelineContext.failed) break;
        try {
          console.log(`⚙️ Executing Plugin: ${plugin.name}`);
          // نمرر الـ data (التي هي الحموله) والـ context
          await plugin.execute(type, data, pipelineContext);
        } catch (err: any) {
          console.error(`❌ Plugin [${plugin.name}] failed:`, err.message);
          if (plugin.isCritical) pipelineContext.failed = true;
        }
      }
      
      console.log("📊 PIPELINE DONE");
    },
    { connection: REDIS_CONFIG }
  );
// modules/core/queues/plugin.worker.ts
import { Worker } from "bullmq";
import { cmsRegistry } from "../plugins/plugin.registry";
import { REDIS_CONFIG } from "./config";

export const initPluginWorker = () =>
  new Worker(
    "plugin-tasks",
    async (job) => {
      console.log("-----------------------------------------");
      console.log(`📦 NEW JOB: ${job.id}`);

      // 1️⃣ فك التشفير حسب الـ EventBus الجديد
      // job.data هو نفسه الـ enrichedEvent اللي بعثته
      const { type, data, meta, context: eventContext } = job.data;

      // التأكد من وجود المعلومات الأساسية
      const eventName = type; 
      const payload = data; // الداتا الحقيقية (pageId, changes, etc.)

      console.log(`🚀 EVENT → ${eventName} (ID: ${meta?.eventId})`);
      console.log(`📝 DATA:`, JSON.stringify(payload, null, 2));

      // 2️⃣ البحث عن الـ Plugins
      const plugins = cmsRegistry
        .getAllPlugins()
        .filter(p => p.enabled && p.events.includes(eventName))
        .sort((a, b) => (b.priority ?? 0) - (a.priority ?? 0));

      console.log(`🧩 Found ${plugins.length} active plugins.`);

      if (!plugins.length) {
        console.log("⚠️ No plugins registered for this event type.");
        return;
      }

      // 3️⃣ تحضير الـ Execution Context
      const pipelineContext = {
        event: eventName,
        payload: payload,
        meta: meta,
        results: [],
        failed: false,
      };

      // 4️⃣ التنفيذ
      for (const plugin of plugins) {
        if (pipelineContext.failed) break;

        const start = Date.now();
        try {
          console.log(`⚙️ Executing: ${plugin.name}`);

          // تمرير الـ payload والـ context للـ plugin
          await plugin.execute(eventName, payload, pipelineContext);

          pipelineContext.results.push({
            plugin: plugin.name,
            ok: true,
            time: Date.now() - start,
          });
        } catch (e: any) {
          console.error(`❌ Plugin [${plugin.name}] Error:`, e.message);
          
          pipelineContext.results.push({
            plugin: plugin.name,
            ok: false,
            error: e.message,
          });

          if (plugin.isCritical) pipelineContext.failed = true;
        }
      }

      console.log("📊 PIPELINE COMPLETED");
      return pipelineContext;
    },
    { connection: REDIS_CONFIG }
  );
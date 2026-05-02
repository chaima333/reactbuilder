import { Worker } from "bullmq";
import { cmsRegistry } from "../plugin.registry";
import { REDIS_CONFIG } from "../../queues/config";

export const initPluginWorker = () => {

  return new Worker(
    "plugin-tasks",
    async (job) => {

      const { event, payload } = job.data;

      console.log(`🚀 PIPELINE START → ${event}`);

      // 1. get plugins
      const plugins = cmsRegistry.getAllPlugins()
        .filter(p => p.events.includes(event))
        .sort((a, b) => (b.priority ?? 0) - (a.priority ?? 0));

      if (!plugins.length) {
        console.log(`⚠️ No plugins for ${event}`);
        return;
      }

      // 2. pipeline context
      const context = {
        event,
        payload,
        results: [],
        failed: false
      };

      // 3. execute pipeline
      for (const plugin of plugins) {

        if (context.failed) {
          console.log(`⛔ Pipeline stopped before ${plugin.name}`);
          break;
        }

        const start = Date.now();

        try {

          console.log(`⚙️ Executing ${plugin.name}`);

          await plugin.execute(event, payload, context);

          context.results.push({
            plugin: plugin.name,
            success: true,
            duration: Date.now() - start
          });

        } catch (err: any) {

          console.error(`❌ Plugin failed: ${plugin.name}`, err.message);

          context.results.push({
            plugin: plugin.name,
            success: false,
            error: err.message
          });

          // 🧠 decide if pipeline should stop
          if (plugin.isCritical) {
            context.failed = true;
          }
        }
      }

      // 4. final report
      console.log("📊 PIPELINE RESULT:", context.results);

      return context;
    },
    {
      connection: REDIS_CONFIG,
    }
  );
};
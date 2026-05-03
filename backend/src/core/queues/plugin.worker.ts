import { Worker } from "bullmq";
import { cmsRegistry } from "../plugins/plugin.registry";
import { REDIS_CONFIG } from "./config";

export const initPluginWorker = () =>
  new Worker(
    "plugin-tasks",
    async (job) => {
      const { event, payload } = job.data;

      console.log(`🚀 EVENT PIPELINE → ${event}`);

      // 1. resolve plugins
      const plugins = cmsRegistry
        .getAllPlugins()
        .filter(p => p.enabled && p.events.includes(event))
        .sort((a, b) => (b.priority ?? 0) - (a.priority ?? 0));

      if (!plugins.length) {
        console.log("⚠️ No plugins for event");
        return;
      }

      // 2. shared context (IMPORTANT)
      const context = {
        event,
        payload,
        results: [],
        failed: false,
      };

      // 3. pipeline execution
      for (const plugin of plugins) {
        if (context.failed) break;

        const start = Date.now();

        try {
          console.log(`⚙️ ${plugin.name}`);

          await plugin.execute(event, payload, context);

          context.results.push({
            plugin: plugin.name,
            ok: true,
            time: Date.now() - start,
          });

        } catch (e: any) {
          console.error(`❌ ${plugin.name}`, e.message);

          context.results.push({
            plugin: plugin.name,
            ok: false,
            error: e.message,
          });

          if (plugin.isCritical) {
            context.failed = true;
          }
        }
      }

      console.log("📊 PIPELINE DONE");
      return context;
    },
    { connection: REDIS_CONFIG }
  );
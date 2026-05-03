import { Worker } from "bullmq";
import { cmsRegistry } from "../plugins/plugin.registry";
import { REDIS_CONFIG } from "./config";

export const initPluginWorker = () =>
  new Worker(
    "plugin-tasks",
    async (job) => {

      const { type, data, context } = job.data;

      console.log("-----------------------------------------");
      console.log(`📦 EVENT RECEIVED → ${type}`);
      console.log(`🆔 ${context.eventId}`);

      const plugins = cmsRegistry
        .getAllPlugins()
        .filter(p => p.enabled && p.events.includes(type))
        .sort((a, b) => (b.priority ?? 0) - (a.priority ?? 0));

      if (!plugins.length) {
        console.log(`⚠️ No plugins for ${type}`);
        return;
      }

      const pipelineContext = {
        event: type,
        payload: data,
        context,
        results: [],
        failed: false
      };

      for (const plugin of plugins) {

        if (pipelineContext.failed) break;

        const start = Date.now();

        try {
          console.log(`⚙️ ${plugin.name}`);

          await plugin.execute(type, data, pipelineContext);

          pipelineContext.results.push({
            plugin: plugin.name,
            ok: true,
            time: Date.now() - start
          });

        } catch (err: any) {

          console.error(`❌ ${plugin.name}`, err.message);

          pipelineContext.results.push({
            plugin: plugin.name,
            ok: false,
            error: err.message
          });

          if (plugin.isCritical) {
            pipelineContext.failed = true;
          }
        }
      }

      console.log("📊 PIPELINE DONE");

      return pipelineContext;
    },
    { connection: REDIS_CONFIG }
  );
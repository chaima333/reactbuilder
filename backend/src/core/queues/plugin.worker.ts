import { Worker } from "bullmq";
import { REDIS_CONFIG } from "./config";
import { cmsRegistry } from "../plugins/plugin.registry";

export const initPluginWorker = () => {
  return new Worker(
    "plugin-tasks",
    async (job) => {

      const { pluginName, event, payload, context } = job.data;

      const plugin = cmsRegistry.getPlugin(pluginName);
      if (!plugin) return;

      try {
        if (typeof plugin.execute === "function") {

          await plugin.execute(event, payload, context); // ✔ FIX HERE

        } else {
          throw new Error(`Plugin ${pluginName} does not have execute()`);
        }

      } catch (error) {
        console.error(`💥 Worker Error: ${pluginName}`, error);
        throw error;
      }
    },
    {
      connection: REDIS_CONFIG,
    }
  );
};
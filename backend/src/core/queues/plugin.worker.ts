import { Worker } from 'bullmq';
import { REDIS_CONFIG } from './config';
import { cmsRegistry } from '../plugins/plugin.registry'; 

export const initPluginWorker = () => {
  const worker = new Worker('plugin-tasks', async (job) => {
  const { pluginName, event, payload } = job.data;
  const plugin = cmsRegistry.getPlugin(pluginName);

  if (!plugin) return;

  try {
    // 🛡️ التثبت السليم قبل التنفيذ
    if (typeof plugin.execute === 'function') {
      await plugin.execute(event, payload);
    } else {
      throw new Error(`Plugin ${pluginName} does not have an execute function`);
    }
  } catch (error) {
    console.error(`💥 [Worker Error]: ${pluginName}`, error);
    throw error; 
  }
}, { connection: REDIS_CONFIG });

  // 🛡️ Global Monitoring
  worker.on('completed', (job) => {
    console.log(`✅ [Worker Monitor]: Job ${job.id} finished successfully`);
  });

  worker.on('failed', (job, err) => {
    console.error(`💥 [Worker Monitor]: Job ${job?.id} failed definitely!`, {
      attempts: `${job?.attemptsMade}/${job?.opts.attempts}`,
      error: err.message
    });
  });

  return worker;
};
import { Worker } from 'bullmq';
import { REDIS_CONFIG } from './config';
import { cmsRegistry } from '../plugins/plugin.registry'; 

export const initPluginWorker = () => {
const worker = new Worker('plugin-tasks', async (job) => {
  const { pluginName, event, payload } = job.data;
  
  try {
    const plugin = cmsRegistry.getPlugin(pluginName);
    if (plugin?.execute) {
      await plugin.execute(event, payload);
    }
  } catch (error) {
    console.error(`💥 [Worker Error] Job ${job.id} for ${pluginName} failed:`, error);
    throw error; 
  }
}, { connection: REDIS_CONFIG });
  worker.on('completed', (job) => console.log(`✅ [Worker] Task ${job.id} done!`));
  worker.on('failed', (job, err) => console.error(`❌ [Worker] Task ${job?.id} failed:`, err));
};
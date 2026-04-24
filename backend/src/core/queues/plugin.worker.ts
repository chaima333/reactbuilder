import { Worker } from 'bullmq';
import { REDIS_CONFIG } from './config';
import { cmsRegistry } from '../plugins/plugin.registry'; 

export const initPluginWorker = () => {
  const worker = new Worker('plugin-tasks', async (job) => {
    const { pluginName, event, payload } = job.data;
    
    console.log(`👷 [Worker] Processing: ${pluginName}`);
    
    const plugin = cmsRegistry.getPlugin(pluginName);
    
    if (plugin && plugin.execute) {
        await plugin.execute(event, payload); 
    } else {
        console.warn(`⚠️ Plugin ${pluginName} has no execute method`);
    }
  }, { connection: REDIS_CONFIG });

  worker.on('completed', (job) => console.log(`✅ [Worker] Task ${job.id} done!`));
  worker.on('failed', (job, err) => console.error(`❌ [Worker] Task ${job?.id} failed:`, err));
};
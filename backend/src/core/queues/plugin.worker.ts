// 📂 src/modules/plugin/plugin.worker.ts
import { Worker } from 'bullmq';
import { REDIS_CONFIG } from './config';
import { cmsRegistry } from '../plugins/plugin.registry'; 

export const initPluginWorker = () => {
  const worker = new Worker('plugin-tasks', async (job) => {
    const { pluginName, event, payload } = job.data;
    const start = Date.now();

    console.log(`📦 [JOB START]: ${pluginName} | ID: ${job.id}`);

    try {
      const plugin = cmsRegistry.getPlugin(pluginName);
      
      // 🛡️ تثبّت إنو الـ Plugin موجود ومفعّل
      if (!plugin || !plugin.enabled) {
        console.warn(`⚠️ [Worker]: Plugin ${pluginName} skipped (Not found or disabled)`);
        return;
      }

      // 🛡️ Timeout Protection (5 ثواني)
      await Promise.race([
        plugin.execute(event, payload),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error(`TIMEOUT: ${pluginName} took too long`)), 5000)
        )
      ]);

      const duration = Date.now() - start;
      console.log(`✅ [JOB DONE]: ${pluginName} | Time: ${duration}ms`);
      
    } catch (error: any) {
      console.error(`💥 [JOB ERROR]: ${pluginName} failed! | Reason: ${error.message}`);
      throw error; // باش BullMQ يعمل الـ Retries
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
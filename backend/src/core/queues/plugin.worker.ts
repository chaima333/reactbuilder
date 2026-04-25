import { Worker } from 'bullmq';
import { REDIS_CONFIG } from './config';
import { cmsRegistry } from '../plugins/plugin.registry'; 

export const initPluginWorker = () => {

const worker = new Worker('plugin-tasks', async (job) => {
  const { pluginName, event, payload } = job.data;
  const plugin = cmsRegistry.getPlugin(pluginName);

  if (!plugin || !plugin.execute) return;

  // 🛡️ 1. Timeout Protection: ما نخليوش Plugin مبلّوك يطيح الـ Worker
  const timeout = 10000; // 10 ثواني
  return Promise.race([
    plugin.execute(event, payload),
    new Promise((_, reject) => 
      setTimeout(() => reject(new Error(`Timeout: Plugin ${pluginName} took too long`)), timeout)
    )
  ]);
}, { connection: REDIS_CONFIG });

// 🛡️ 2. Global Monitoring: تسجيل الفشل والنجاح بوضوح
worker.on('completed', (job) => {
  console.log(`✅ [Job Completed]: ${job.id}`);
});

worker.on('failed', (job, err) => {
  console.error(`💥 [Job Failed] ID: ${job?.id} | Attempts: ${job?.attemptsMade}/${job?.opts.attempts}`, {
    error: err.message,
    stack: err.stack
  });
  // هوني تنجم تزيد Notification لـ Discord أو Slack باش تفيق اللي فمة مشكلة
});
  
};
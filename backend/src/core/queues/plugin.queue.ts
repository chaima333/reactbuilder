// 📂 src/queues/plugin.queue.ts
import { Queue } from 'bullmq';
import { REDIS_CONFIG } from './config';

export const pluginQueue = new Queue('plugin-tasks', {
  connection: REDIS_CONFIG
});


export const addToQueue = async (pluginName: string, event: string, payload: any, options: { priority?: number } = {}) => {
  const uniqueJobId = `${pluginName}-${event}-${payload.page?.id}`;

  await pluginQueue.add(
    pluginName, 
    { pluginName, event, payload },
    {
      jobId: uniqueJobId,
      priority: options.priority || 10, // 🔥 BullMQ يرتب الـ Jobs حسب هذا الرقم
      attempts: 3,
      backoff: { type: 'exponential', delay: 2000 }
    }
  );
};
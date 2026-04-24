// 📂 src/queues/plugin.queue.ts
import { Queue } from 'bullmq';
import { REDIS_CONFIG } from './config';

export const pluginQueue = new Queue('plugin-tasks', {
  connection: REDIS_CONFIG
});

export const addToQueue = async (pluginName: string, event: string, payload: any) => {
  // 🛡️ صنع ID فريد يمنع التكرار (Plugin + Event + PageId)
  const uniqueJobId = `${pluginName}-${event}-${payload.page?.id || 'no-id'}`;

  await pluginQueue.add(
    pluginName, 
    { pluginName, event, payload },
    {
      jobId: uniqueJobId, // 🔥 أهم سطر: BullMQ يقتل الـ Duplicates آلياً
      attempts: 5,
      backoff: {
        type: 'exponential',
        delay: 2000,
      },
      removeOnComplete: true,
      removeOnFail: false,
    }
  );
};
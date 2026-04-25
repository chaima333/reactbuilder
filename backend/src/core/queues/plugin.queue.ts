// 📂 src/queues/plugin.queue.ts
import { Queue } from 'bullmq';
import { REDIS_CONFIG } from './config';

export const pluginQueue = new Queue('plugin-tasks', {
  connection: REDIS_CONFIG
});

// 📂 src/queues/plugin.queue.ts
export const addToQueue = async (pluginName: string, event: string, payload: any) => {
  const uniqueJobId = `${pluginName}-${event}-${payload.page?.id}`;

  await pluginQueue.add(
    pluginName, 
    { pluginName, event, payload },
    {
      jobId: uniqueJobId,
      attempts: 3, // جرب 3 مرات
      backoff: {
        type: 'exponential',
        delay: 5000, // ابدأ بـ 5 ثواني (5ث، 10ث، 20ث...)
      },
      removeOnComplete: { age: 3600 }, // خلي المهام الناجحة ساعة للـ Debugging
      removeOnFail: { age: 24 * 3600 }, // خلي المهام الفاشلة يوم كامل باش نراجعوها
    }
  );
};
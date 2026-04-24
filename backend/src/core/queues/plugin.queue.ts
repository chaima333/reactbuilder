import { Queue } from 'bullmq';
import { REDIS_CONFIG } from './config';

// صنع الـ Queue اللي باش تتسجل فيها الـ Tasks
export const pluginQueue = new Queue('plugin-tasks', {
  connection: REDIS_CONFIG
});

// 📂 src/queues/plugin.queue.ts
export const addToQueue = async (pluginName: string, event: string, payload: any) => {
  await pluginQueue.add(
    pluginName, 
    { pluginName, event, payload },
    {
      // 🛡️ الـ Hardening Layer
      attempts: 5, // جرب 5 مرات قبل ما تستسلم
      backoff: {
        type: 'exponential',
        delay: 2000, // استنى 2ث، 4ث، 8ث... هكا ما نتعبوش الـ CPU
      },
      removeOnComplete: true, // نظف الـ Redis كي تكمل
      removeOnFail: false,    // خلي الفاشلين باش نراجعوهم (Dead Letter Queue)
    }
  );
};
import { Queue } from 'bullmq';
import { REDIS_CONFIG } from './config';

// صنع الـ Queue اللي باش تتسجل فيها الـ Tasks
export const pluginQueue = new Queue('plugin-tasks', {
  connection: REDIS_CONFIG
});

export const addToQueue = async (pluginName: string, event: string, payload: any) => {
  await pluginQueue.add(pluginName, {
    pluginName,
    event,
    payload
  }, {
    attempts: 3, // لو فشل الـ Plugin، عاود جرب 3 مرات آلياً
    backoff: { type: 'exponential', delay: 1000 } // استنى شويّة قبل ما تعاود
  });
};
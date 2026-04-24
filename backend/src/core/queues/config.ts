// 📂 src/core/queues/config.ts (أو حسب مسار الملف عندك)

export const REDIS_CONFIG = {
  host: process.env.REDIS_HOST || '127.0.0.1', 
  port: Number(process.env.REDIS_PORT) || 6379,
  // ⚠️ هذي أهم وحدة باش الـ BullMQ ما يقعدش يخرج في AggregateError
  maxRetriesPerRequest: null, 
};
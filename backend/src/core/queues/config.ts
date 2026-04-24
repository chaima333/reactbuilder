// 📂 src/core/queues/config.ts

export const REDIS_CONFIG = {
  host: process.env.REDIS_HOST,
  port: Number(process.env.REDIS_PORT) || 6379,
  password: process.env.REDIS_PASSWORD,
  // 🔥 هذي أهم زيادة للـ Upstash
  tls: process.env.REDIS_TLS === 'true' ? {} : undefined, 
  maxRetriesPerRequest: null,
};
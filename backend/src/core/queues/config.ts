// 📂 src/core/queues/config.ts

export const REDIS_CONFIG = {
  host: process.env.REDIS_HOST,
  port: Number(process.env.REDIS_PORT) || 6379,
  password: process.env.REDIS_PASSWORD,
  // 🔥 هوني السر: Upstash يخدم بـ TLS 
  // لازم تعطيه Object فارغ {} موش true
  tls: {
    rejectUnauthorized: false // هذي تخليك تتعدى لو فمة مشكلة في الشهادات
  },
  maxRetriesPerRequest: null,
  connectTimeout: 10000, // زيد الوقت شوية باش ما يزربش الـ Timeout
};
// src/core/queues/config.ts
import Redis from "ioredis";

export const REDIS_CONFIG: any = {
  host: process.env.REDIS_HOST,
  port: Number(process.env.REDIS_PORT) || 6379,
  password: process.env.REDIS_PASSWORD,
  // ✅ Upstash يحتاج TLS هكا باش يخدم مريغل
  tls: process.env.REDIS_TLS === "true" ? { rejectUnauthorized: false } : undefined,
  
  maxRetriesPerRequest: null,
  connectTimeout: 5000, // نقصنا فيها لـ 5 ثواني باش ما نقعدوش نستناو برشة
  
  // 🔥 أهم سطر: باش الـ Backend ما يتبلوكش كيف يطيح الـ Redis
  retryStrategy(times: number) {
    const delay = Math.min(times * 50, 2000);
    if (times > 3) {
      console.error("⚠️ Redis connection failed, retrying in 2s...");
      return delay;
    }
    return delay;
  },
};

export const redis = new Redis(REDIS_CONFIG);

// ✅ نزيدو هذي باش نفيقو بالـ Error وما يطيحش السيرفر كامل
redis.on("error", (err) => {
  console.error("❌ Redis Client Error:", err.message);
});
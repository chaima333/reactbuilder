// src/core/queues/config.ts
import Redis from "ioredis";

// 1. تثبّت هل فمّا رابط كامل (REDIS_URL) أو لا
const redisUrl = process.env.REDIS_URL;

export const REDIS_CONFIG: any = redisUrl 
  ? {
      // ✅ إذا فمّا URL كامل، ioredis يعرف يتصرف معاه وحدو
      connectionString: redisUrl,
      maxRetriesPerRequest: null,
      // Render Internal Redis ما يحتاجش TLS عادةً، لكن إذا استعملت Upstash خلّيها
      tls: process.env.REDIS_TLS === "true" ? { rejectUnauthorized: false } : undefined,
    }
  : {
      // ❌ الطريقة القديمة (خلّيها كـ fallback للـ Local)
      host: process.env.REDIS_HOST || "127.0.0.1",
      port: Number(process.env.REDIS_PORT) || 6379,
      password: process.env.REDIS_PASSWORD,
      tls: process.env.REDIS_TLS === "true" ? { rejectUnauthorized: false } : undefined,
      maxRetriesPerRequest: null,
    };

// نزيدو الـ retryStrategy للزوز حالات
const finalConfig = {
  ...REDIS_CONFIG,
  connectTimeout: 5000,
  retryStrategy(times: number) {
    return Math.min(times * 50, 2000);
  },
};

// إنشاء الـ instance
export const redis = redisUrl ? new Redis(redisUrl, finalConfig) : new Redis(finalConfig);

redis.on("error", (err) => {
  console.error("❌ Redis Client Error:", err.message);
});
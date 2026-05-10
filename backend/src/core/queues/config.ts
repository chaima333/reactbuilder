// src/core/queues/config.ts
import Redis from "ioredis";

const redisUrl = process.env.REDIS_URL;

// ✅ لازم يكون اسمه REDIS_CONFIG ويكون قبله كلمة export
export const REDIS_CONFIG: any = redisUrl 
  ? {
      maxRetriesPerRequest: null,
      connectTimeout: 10000,
      // إذا كنت تستعمل الـ URL، ioredis تو يقرى الـ host/port منه
    }
  : {
      host: process.env.REDIS_HOST || "127.0.0.1",
      port: Number(process.env.REDIS_PORT) || 6379,
      password: process.env.REDIS_PASSWORD,
      maxRetriesPerRequest: null,
    };

// هذي الـ Instance متاع الـ Redis
export const redis = redisUrl ? new Redis(redisUrl, REDIS_CONFIG) : new Redis(REDIS_CONFIG);

redis.on("error", (err) => {
  console.error("❌ Redis Client Error:", err.message);
});
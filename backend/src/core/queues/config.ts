import Redis from "ioredis";

const redisUrl = process.env.REDIS_URL;

// ✅ هكا نضمنو إنو ioredis يستعمل الرابط الكامل متاع Render
export const REDIS_CONFIG: any = {
  maxRetriesPerRequest: null,
  connectTimeout: 10000,
  retryStrategy: (times: number) => Math.min(times * 50, 2000),
};

// إنشاء الـ connection باستعمال الـ URL مباشرة
export const redis = redisUrl 
  ? new Redis(redisUrl, { maxRetriesPerRequest: null }) 
  : new Redis(REDIS_CONFIG);

redis.on("error", (err) => {
  console.error("❌ Redis Client Error:", err.message);
});
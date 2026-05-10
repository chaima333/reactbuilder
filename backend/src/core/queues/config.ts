import Redis from "ioredis";

const redisUrl = process.env.REDIS_URL;

export const REDIS_CONFIG: any = redisUrl 
  ? {
      // ✅ في Render: يقرأ الرابط كامل (Internal URL)
      maxRetriesPerRequest: null,
      connectTimeout: 10000,
    }
  : {
      // 🏠 Local: يرجع للـ localhost إذا ما فش URL
      host: process.env.REDIS_HOST || "127.0.0.1",
      port: Number(process.env.REDIS_PORT) || 6379,
      maxRetriesPerRequest: null,
    };

// الربط بالـ Redis
export const redis = redisUrl ? new Redis(redisUrl, REDIS_CONFIG) : new Redis(REDIS_CONFIG);

redis.on("error", (err) => {
  console.error("❌ Redis Client Error:", err.message);
});
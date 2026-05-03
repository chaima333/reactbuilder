// src/core/queues/config.ts
import Redis from "ioredis";

export const REDIS_CONFIG = {
  host: process.env.REDIS_HOST,
  port: Number(process.env.REDIS_PORT) || 6379,
  password: process.env.REDIS_PASSWORD,
  tls: {
    rejectUnauthorized: false 
  },
  maxRetriesPerRequest: null,
  connectTimeout: 10000,
};

// 🔥 نزيدو السطر هذا باش نصنعو الكليون فعلياً
export const redis = new Redis(REDIS_CONFIG);
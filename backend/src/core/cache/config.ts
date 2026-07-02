import Redis from "ioredis";

const redisUrl =
  process.env.REDIS_URL;

if (!redisUrl) {
  throw new Error(
    "REDIS_URL missing"
  );
}

const parsedRedisUrl =
  new URL(redisUrl);

console.log(
  "REDIS_URL_USED",
  parsedRedisUrl.protocol,
  parsedRedisUrl.host
);

export const redis =
  new Redis(redisUrl, {
    maxRetriesPerRequest: null,
    connectTimeout: 20000,

    retryStrategy(times) {
      return Math.min(
        times * 500,
        5000
      );
    }
  });

redis.on("connect", () => {
  console.log("✅ Redis connect");
});

redis.on("ready", () => {
  console.log("✅ Redis ready");
});

redis.on("error", (error) => {
  console.error(
    "❌ Redis error:",
    error.message
  );
});
import Redis from "ioredis";

if (!process.env.REDIS_URL) {
  throw new Error("REDIS_URL missing");
}

export const redis =
  new Redis(
    process.env.REDIS_URL,
    {
      maxRetriesPerRequest: null,
      connectTimeout: 10000,
      retryStrategy(times) {
        return Math.min(times * 500, 5000);
      }
    }
  );

redis.on("ready", () => {
  console.log("✅ Redis ready");
});

redis.on("error", (error) => {
  console.error("❌ Redis error:", error.message);
});
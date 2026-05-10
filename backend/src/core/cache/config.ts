import Redis from "ioredis";

if (!process.env.REDIS_URL) {
  throw new Error(
    "REDIS_URL missing"
  );
}

export const redis =
  new Redis(
    process.env.REDIS_URL,
    {
      maxRetriesPerRequest:
        null,

      tls: {},
    }
  );
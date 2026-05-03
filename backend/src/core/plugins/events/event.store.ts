type EventItem = {
  id: string;
  type: string;
  timestamp: number;
  payload: any;
};


import Redis from "ioredis"; // لازم تعمل npm install ioredis لو مش موجودة
import { REDIS_CONFIG } from "../../queues/config";

// صنع الـ Client اللي باش يتكلم مع Redis
const redis = new Redis(REDIS_CONFIG);

// core/plugins/events/event.store.ts

class EventStore {
  private readonly KEY = "dashboard:runtime:events";

  async add(event: EventItem) {
    try {
      // نثبتو إنو الـ Redis متصل قبل ما نبعثو
      if (redis.status !== "ready") {
        await new Promise((resolve) => redis.once("ready", resolve));
      }
      
      const result = await redis.lpush(this.KEY, JSON.stringify(event));
      await redis.ltrim(this.KEY, 0, 49);
      
      console.log(`✅ [EventStore] Saved! New list length: ${result}`);
    } catch (err) {
      console.error("🚨 [EventStore] Redis Push Error:", err);
    }
  }
  

  async getLatest() {
    try {
      const data = await redis.lrange(this.KEY, 0, -1);
      return data.map(item => JSON.parse(item));
    } catch (err) {
      console.error("🚨 [EventStore] Redis Get Error:", err);
      return [];
    }
  }
}

export const eventStore = new EventStore();
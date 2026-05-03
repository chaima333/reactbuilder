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

class EventStore {
  private readonly KEY = "dashboard:runtime:events";

  async add(event: EventItem) {
    try {
      // ✅ نخدمو بـ redis (الـ client) مش الـ config
      await redis.lpush(this.KEY, JSON.stringify(event));
      await redis.ltrim(this.KEY, 0, 49);
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
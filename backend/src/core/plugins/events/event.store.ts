
import Redis from "ioredis";
import { REDIS_CONFIG } from "../../queues/config";

const redis = new Redis(REDIS_CONFIG);

export type EventItem = {
  id: string;
  type: string;
  timestamp: number;
  payload: any;
};

class EventStore {
  private readonly KEY = "dashboard:runtime:events";

  async add(event: EventItem) {
    try {
      console.log(`📝 [Redis] Adding event: ${event.type}`);
      const data = JSON.stringify(event);
      await redis.lpush(this.KEY, data);
      await redis.ltrim(this.KEY, 0, 14);
    } catch (err) {
      console.error("🚨 [Redis] Push Error:", err);
    }
  }

  async getLatest() {
    try {
      console.log(`🔍 [Redis] Checking Key: ${this.KEY}`);
      const data = await redis.lrange(this.KEY, 0, -1);
      console.log(`📊 [Redis] Raw Data Found:`, data); 
      return data.map(item => JSON.parse(item));
    } catch (err) {
      console.error("🚨 [Redis] Get Error:", err);
      return [];
    }
  } 
} 

// تصدير نسخة واحدة فقط (Singleton)
export const eventStore = new EventStore();
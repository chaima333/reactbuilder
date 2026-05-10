import { redis  } from "../../queues/config";
import { UnifiedEvent } from "./contracts/unified.contract";


class EventStore {
  private readonly KEY = "dashboard:runtime:events";

  async add(event: UnifiedEvent) {
    try {
      console.log(`📝 [Redis] Adding event: ${event.type}`);
      const data = JSON.stringify(event);
      await redis.lpush(this.KEY, data);
      await redis.ltrim(this.KEY, 0, 14); // الاحتفاظ بآخر 15 حدث فقط
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

export const eventStore = new EventStore();
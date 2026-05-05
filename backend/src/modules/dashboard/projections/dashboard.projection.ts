import { redis } from "../../../core/queues/config";

const KEY = (siteId: number) => `dashboard:projection:${siteId}`;

export const DashboardProjection = {
  
  async get(siteId: number) {
    const data = await redis.get(KEY(siteId));
    return data ? JSON.parse(data) : null;
  },

  async save(siteId: number, snapshot: any) {
    await redis.set(KEY(siteId), JSON.stringify(snapshot), "EX", 60);
  },

  async invalidate(siteId: number) {
    await redis.del(KEY(siteId));
  }
};
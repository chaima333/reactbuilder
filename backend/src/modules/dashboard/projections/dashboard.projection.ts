import { redis } from "../../../core/queues/config";

const KEY = (siteId: number) => `dashboard:read:${siteId}`;

export const DashboardProjection = {

  async save(siteId: number, data: any) {
    await redis.set(KEY(siteId), JSON.stringify(data));
  },

  async get(siteId: number) {
    const data = await redis.get(KEY(siteId));
    return data ? JSON.parse(data) : null;
  }

};
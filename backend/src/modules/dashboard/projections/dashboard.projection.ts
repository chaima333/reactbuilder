// src/modules/dashboard/projections/dashboard.projection.ts
import { redis } from "../../../core/queues/config";

const KEY = (siteId: number) => `dashboard:projection:${siteId}`;

export const DashboardProjection = {
  async get(siteId: number) {
    try {
      const data = await redis.get(KEY(siteId));
      if (data) {
        console.log(`📡 Cache Hit for site ${siteId}`);
        return JSON.parse(data);
      }
      console.log(`❄️ Cache Miss for site ${siteId}`);
      return null;
    } catch (err: any) {
      console.error("⚠️ Redis GET Error:", err.message);
      return null;
    }
  },

  async save(siteId: number, snapshot: any) {
    try {
      // نزيد مدة الكاش لـ 3600 ثانية (ساعة) للتجربة لضمان عدم ضياع البيانات بسرعة
      await redis.set(KEY(siteId), JSON.stringify(snapshot), "EX", 3600);
      console.log(`💾 Snapshot stored in Redis for site ${siteId}`);
    } catch (err: any) {
      console.error("⚠️ Redis SAVE Error:", err.message);
    }
  }
};
import { redis } from "../../../core/queues/config";

const PREFIX = "dashboard:projection";

export class DashboardProjection {

  static async get(siteId: number) {
    const data = await redis.get(`${PREFIX}:${siteId}`);
    return data ? JSON.parse(data) : null;
  }

  static async save(siteId: number, snapshot: any) {
    await redis.set(
      `${PREFIX}:${siteId}`,
      JSON.stringify(snapshot),
      "EX",
      60 // cache 1 min
    );
  }

  static async invalidate(siteId: number) {
    await redis.del(`${PREFIX}:${siteId}`);
  }
}
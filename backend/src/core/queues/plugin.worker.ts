import { Worker } from "bullmq";

import { cmsRegistry } from "../plugins/plugin.registry";
import { REDIS_CONFIG, redis } from "./config";
import { UnifiedEvent, validateEvent } from "../plugins/events/contracts/unified.contract";

import { rebuildDashboardProjection } from "../../modules/dashboard/services/rebuildDashboardProjection";

/**
 * 🔑 Redis keys
 */
const DLQ_KEY = "dashboard:dead:letters";

const getSiteHistoryKey = (siteId: string | number) =>
  `dashboard:events:site:${siteId}`;

const GLOBAL_HISTORY_KEY = "dashboard:runtime:events";

/**
 * 🚀 Plugin Worker (Single source of truth for execution)
 */
export const initPluginWorker = () => {
  const worker = new Worker(
    "plugin-tasks",
    async (job) => {
      const rawEvent = JSON.parse(JSON.stringify(job.data)) as UnifiedEvent;

      // 1️⃣ Validate event
      const validation = validateEvent(rawEvent);
      if (!validation.isValid) {
        console.error("❌ INVALID EVENT:", validation.error);

        await redis.lpush(
          DLQ_KEY,
          JSON.stringify({ event: rawEvent, error: validation.error })
        );

        return;
      }

      // 2️⃣ Idempotency lock
      const lockKey = `evt:done:${rawEvent.id}`;
      const isFirstTime = await redis.set(lockKey, "1", "PX", 10000, "NX");

      if (!isFirstTime) {
        console.log("⏭️ Duplicate event skipped:", rawEvent.id);
        return;
      }

      console.log(
        `📦 Processing event [${rawEvent.type}] trace=${rawEvent.traceId}`
      );

      // 3️⃣ Execute plugins
      const plugins = cmsRegistry
        .getAllPlugins()
        .filter(
          (p) => p.enabled && p.events.includes(rawEvent.type)
        );

      for (const plugin of plugins) {
        try {
          const eventCopy = JSON.parse(JSON.stringify(rawEvent));
          await plugin.execute(eventCopy);
        } catch (err: any) {
          console.error(`🚨 Plugin failed (${plugin.name}):`, err.message);
        }
      }

      // 4️⃣ Persistence (Redis history)
      try {
        const siteId = rawEvent.data?.current?.siteId || "global";

        const pipeline = redis.multi();

        pipeline.lpush(
          getSiteHistoryKey(siteId),
          JSON.stringify(rawEvent)
        );
        pipeline.ltrim(getSiteHistoryKey(siteId), 0, 99);

        pipeline.lpush(
          GLOBAL_HISTORY_KEY,
          JSON.stringify(rawEvent)
        );
        pipeline.ltrim(GLOBAL_HISTORY_KEY, 0, 99);

        await pipeline.exec();

        console.log("💾 Event stored in history");

      } catch (err) {
        console.error("❌ Persistence error:", err);
      }

      // 5️⃣ 🔥 Dashboard Projection (IMPORTANT PLACE)
      try {
        const siteId = rawEvent.data?.current?.siteId;

        if (siteId) {
          await rebuildDashboardProjection(siteId);
          console.log("📊 Dashboard rebuilt for site:", siteId);
        }

      } catch (err) {
        console.error("❌ Dashboard rebuild failed:", err);
      }
    },
    {
      connection: REDIS_CONFIG,
      concurrency: 5
    }
  );

  worker.on("failed", async (job, err) => {
    console.error("☢️ Worker failed:", err.message);

    await redis.lpush(
      DLQ_KEY,
      JSON.stringify({
        jobId: job?.id,
        error: err.message,
        timestamp: new Date().toISOString()
      })
    );
  });

  console.log("🚀 Plugin Worker is LIVE");
  return worker;
};
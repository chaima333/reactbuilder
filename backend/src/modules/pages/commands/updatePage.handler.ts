// modules/pages/commands/updatePage.handler.ts

import { Page } from "../../../models/page";
import { emitDomainEvent, getSemanticDiff } from "../domain/diff";
import { redis } from "../../../core/queues/config";
import { normalizePage } from "../../../core/plugins/events/contracts/unified.contract";
import { rebuildDashboardProjection } from "../../dashboard/controllers/dashboard.controller";

export const updatePageHandler = async (command: any) => {
  try {
    const payload = command?.payload;
    const context = command?.context;

    // 🧱 HARD GUARDS
    if (!payload?.pageId) {
      return { success: false, error: "missing pageId" };
    }

    if (!context || !context.userId) {
      return { success: false, error: "invalid context" };
    }

    // 🔍 fetch page
    const page = await Page.findByPk(payload.pageId);
    if (!page) {
      return { success: false, error: "page not found" };
    }

    // 🧠 normalize old state
    const oldPage = normalizePage(page);

    // 🔒 allow only safe fields
    const allowedFields = ["title", "content", "blocks", "slug", "status"];
    const safePayload: any = {};

    for (const field of allowedFields) {
      if (payload[field] !== undefined) {
        safePayload[field] = payload[field];
      }
    }

    // 💾 update DB
    await page.update(safePayload);

    // 🔄 reload updated state
    const updated = await page.reload();
    const current = normalizePage(updated);

    // 🧠 detect meaningful changes
    const changes = getSemanticDiff(oldPage, current);

    if (!changes.length) {
      return {
        success: true,
        updated: false,
        data: current
      };
    }

    // 📡 EMIT DOMAIN EVENT (single source)
    await emitDomainEvent(
      "page.updated",
      {
        current,
        previous: oldPage,
        changes
      },
      {
        userId: context.userId,
        siteId: current.siteId,
        source: "page.handler",
        depth: 0,
        traceId: context.traceId
      }
    );

    // 🧹 CACHE INVALIDATION (🔥 مهم برشة)
    //await redis.del(`dashboard:stats:${current.siteId}`);
    await rebuildDashboardProjection(context.siteId);

    return {
      success: true,
      updated: true,
      data: current
    };

  } catch (error: any) {
    console.error("❌ updatePageHandler ERROR:", error.message);

    return {
      success: false,
      error: error.message
    };
  }
};
// modules/pages/commands/updatePage.handler.ts

import { Page } from "../../../models/page";
import { emitDomainEvent, getSemanticDiff } from "../domain/diff";
import { normalizePage } from "../../../core/plugins/events/contracts/unified.contract";
import { ActivityService } from "../../dashboard/services/activity.service";

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

    
    await ActivityService.log({
     userId: context.userId,
     siteId: current.siteId,
  action: "page_updated",
  entityType: "page",
  entityId: current.id
});
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
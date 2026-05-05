import { normalizePage } from "../../../core/plugins/events/contracts/unified.contract.ts";
import { Page } from "../../../models/page";
import { emitDomainEvent, getSemanticDiff } from "../domain/diff";

const inflight = new Set<string>();

export const updatePageHandler = async (command: any = {}) => {
  const payload = command?.payload;
  const context = command?.context || {};

  // 🧨 HARD GUARD (important)
  if (!payload?.pageId) {
    return { success: false, error: "INVALID_PAYLOAD: pageId missing" };
  }

  const lockKey = `update:${payload.pageId}`;

  if (inflight.has(lockKey)) {
    return { success: false, error: "busy" };
  }

  try {
    inflight.add(lockKey);

    // 🔥 strict source control (prevents loops)
    if (context.source && context.source !== "http") {
      return { success: false, error: "invalid source" };
    }

    const page = await Page.findByPk(payload.pageId);
    if (!page) {
      return { success: false, error: "not found" };
    }

    const old = normalizePage(page);

    const allowed = ["title", "content", "blocks", "slug", "status"];
    const safe: any = {};

    for (const f of allowed) {
      if (payload[f] !== undefined) {
        safe[f] = payload[f];
      }
    }

    await page.update(safe);
    const updated = await page.reload();
    const current = normalizePage(updated);

    const changes = getSemanticDiff(old, current);

    // no meaningful changes → no event
    if (!changes.length) {
      return { success: true, updated: false, data: current };
    }

    await emitDomainEvent(
      "page.updated",
      {
        current,
        previous: old,
        changes
      },
      {
        userId: context.userId || null,
        siteId: current.siteId,
        source: "page.handler",
        depth: 0,
        traceId: context.traceId
      }
    );

    return { success: true, updated: true, data: current };

  } catch (err: any) {
    console.error("UPDATE HANDLER ERROR:", err);
    return { success: false, error: err.message };
  } finally {
    setTimeout(() => inflight.delete(lockKey), 1000);
  }
};
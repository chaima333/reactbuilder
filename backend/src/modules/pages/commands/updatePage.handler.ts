import { normalizePage } from "../../../core/plugins/events/contracts/unified.contract.ts";
import { Page } from "../../../models/page";
import { emitDomainEvent, getSemanticDiff } from "../domain/diff";


export const updatePageHandler = async (command: any) => {

  const payload = command?.payload;
  const context = command?.context;

  if (!payload?.pageId) {
    return { success: false, error: "missing pageId" };
  }

  const page = await Page.findByPk(payload.pageId);
  if (!page) return { success: false, error: "not found" };

  const oldPage = normalizePage(page);

  const allowed = ["title", "content", "blocks", "slug", "status"];
  const safe: any = {};

  for (const f of allowed) {
    if (payload[f] !== undefined) safe[f] = payload[f];
  }

  await page.update(safe);
  const updated = await page.reload();
  const current = normalizePage(updated);

  const changes = getSemanticDiff(oldPage, current);

  if (!changes.length) {
    return { success: true, updated: false, data: current };
  }

  await emitDomainEvent(
    "page.updated",
    {
      current,
      previous: oldPage,
      changes
    },
    {
      userId: context?.userId,
      siteId: current.siteId,
      source: "page.handler",
      depth: 0,
      traceId: context?.traceId
    }
  );

  return { success: true, updated: true, data: current };
};
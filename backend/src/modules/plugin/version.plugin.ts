import { PageEventPayload } from "../../core/plugins/events/types";
import { ICmsPlugin } from "../../core/plugins/plugin.types";
import { PageVersionRepository } from "../pages/repositories/pageVersion.repository";

export const VersionPlugin: ICmsPlugin = {
  name: "version-plugin",
  mode: "sync",
  priority: 100,
  isCritical: true,
  events: ["page.updated", "page.restored"],
  enabled: true,

async execute(event, payload: PageEventPayload) {
  const { current, previous, context, flags } = payload;

  if (!current || !previous || !context) return;
  if (!flags?.shouldVersion) return;

  const hasRealChange =
    current.title !== previous.title ||
    current.content !== previous.content ||
    current.status !== previous.status ||
    JSON.stringify(current.blocks) !== JSON.stringify(previous.blocks);

  if (!hasRealChange) {
    console.log("🟡 No real change → skip version");
    return;
  }

  await PageVersionRepository.create({
    pageId: current.id,
    siteId: context.siteId,
    versionNumber: Date.now(),
    title: current.title,
    content: current.content,
    blocks: current.blocks,
    status: current.status,
    createdBy: context.userId
  });

  console.log("📦 Version created:", current.id);
}
};
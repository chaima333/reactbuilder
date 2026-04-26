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

  async execute(event, payload) {
    const { current, previous, context, changes } = payload;

    if (!context || !current || !previous) return;
    if (!changes || changes.length === 0) return;

    const hasRealChange = changes.length > 0;

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

    console.log("📦 Version created:", previous.id, "→", current.id);
  }
};
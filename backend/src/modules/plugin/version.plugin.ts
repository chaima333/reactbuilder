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
  const current = payload.current;
  const previous = payload.previous;
  const context = payload.context;
  const flags = payload.flags;

  if (flags?.shouldVersion === false) {
    console.log("🛑 versioning disabled");
    return;
  }

  if (!current || !context) {
    console.error("❌ Invalid payload structure");
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

  console.log("📦 Version created:", previous?.id, "→", current.id);
}
};
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
  const data = payload.data;

  if (!data?.shouldVersion) {
    console.log("🛑 versioning disabled");
    return;
  }

  const current = data.current;
  const previous = data.previous;

  if (!current) {
    console.error("❌ Invalid payload structure");
    return;
  }

  await PageVersionRepository.create({
    pageId: current.id,
    siteId: payload.context.siteId,
    title: current.title,
    content: current.content,
    blocks: current.blocks,
    status: current.status,
    createdBy: payload.context.userId
  });

  console.log("📦 Version created:", previous?.id, "→", current.id);
}
};
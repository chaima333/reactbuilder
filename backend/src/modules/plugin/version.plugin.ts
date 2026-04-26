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
  const { data, context, flags } = payload;

  const current = data?.current;
  const previous = data?.previous;

  if (!flags?.shouldVersion) return;

  if (!current || !previous || !context) return;

  // 🔥 IMPORTANT: ignore if no real change
  const changed =
    JSON.stringify(current) !== JSON.stringify(previous);

  if (!changed) {
    console.log("🟡 No changes → skip version");
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
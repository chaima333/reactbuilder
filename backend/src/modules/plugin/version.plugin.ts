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
  const current = payload?.current;
  const previous = payload?.previous;
  const context = payload?.context;
  const flags = payload?.flags;

  if (!current || !previous || !context || !flags) {
    console.error("🚨 Invalid payload structure", payload);
    return;
  }


    if (!flags?.shouldVersion) return;
    if (!current || !previous || !context) return;

    // 🔥 REAL CHANGE CHECK (correct way)
  const hasRealChange =
  current.title !== previous.title ||
  current.content !== previous.content ||
  current.status !== previous.status ||
  Array.isArray(current.blocks) &&
  Array.isArray(previous.blocks) &&
  current.blocks.length !== previous.blocks.length;

    if (!hasRealChange) {
      console.log("🟡 No real change → skip version log");
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
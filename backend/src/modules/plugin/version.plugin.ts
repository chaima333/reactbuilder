import { PAGE_EVENTS } from "../../core/plugins/events/pageEvents";
import { ICmsPlugin } from "../../core/plugins/plugin.types";
import { PageVersionRepository } from "../pages/repositories/pageVersion.repository";

export const VersionPlugin: ICmsPlugin = {
  name: "version-plugin",
  mode: "sync",
  priority: 100,
  isCritical: true,
  events: [PAGE_EVENTS.UPDATED, PAGE_EVENTS.RESTORED],
  enabled: true,

  register() {
    console.log("🔌 [VersionPlugin]: Ready and Trusting the Dispatcher");
  },

  async execute(event: string, payload: any) {
  const { data } = payload;

  const current = data?.new || data?.actuel;
  const previous = data?.old || data?.précédent;

  if (!current || !previous) {
    console.log("🛑 Skip: invalid payload structure");
    return;
  }

  console.log("🔥 VersionPlugin START");

  try {
    await PageVersionRepository.create({
      pageId: current.id,
      siteId: data.context.siteId,
      title: current.title,
      content: current.content,
      blocks: current.blocks,
      createdBy: data.context.userId,
    });

    console.log("✅ Version created");
  } catch (err) {
    console.error("💥 DB error:", err);
  }

  console.log("🔥 VersionPlugin END");
}
};
import { ICmsPlugin } from "../../core/plugins/plugin.interface";
import { PAGE_EVENTS } from "../../core/plugins/events/pageEvents";
import { PageVersionRepository } from "../pages/repositories/pageVersion.repository";

export const VersionPlugin: ICmsPlugin = {
  name: "version-plugin",
  mode: "sync",
  priority: 100,
  events: [PAGE_EVENTS.UPDATED],
  enabled: true,

  register({ eventBus }) {
    console.log("🔌 [VersionPlugin]: Registered for sync snapshots");
  },

async execute(event: string, payload: any) {
  const { oldPage, meta } = payload;

  // 🛡️ الـ Strict Rule:
  const hasContent = oldPage?.content || (oldPage?.blocks && oldPage.blocks.length > 0);
  const isExplicitVersion = meta?.shouldVersion === true;

  if (isExplicitVersion && hasContent) {
    await PageVersionRepository.create({
      pageId: oldPage.id,
      siteId: payload.siteId,
      title: oldPage.title,
      content: oldPage.content,
      blocks: oldPage.blocks,
      createdBy: payload.userId,
      versionTag: meta?.restored ? `restored_from_${meta.versionId}` : `v_${Date.now()}`
    });
    console.log(`✅ [VersionPlugin]: Clean Snapshot saved.`);
  }
}
};
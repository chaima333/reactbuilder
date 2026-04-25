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
  const { oldPage, shouldVersion, siteId, userId } = payload;

  if (shouldVersion && oldPage) {
    await PageVersionRepository.create({
      pageId: oldPage.id,
      siteId: siteId,
      title: oldPage.title,      // 👈 توّة الـ title ماهوش null
      content: oldPage.content,  // 👈 توّة الـ content ماهوش null
      blocks: oldPage.blocks,    // 👈 توّة الـ blocks ماهوش null
      createdBy: userId,
      versionTag: `v_${Date.now()}`
    });
    console.log(`✅ [VersionPlugin]: Full Snapshot saved for page ${oldPage.id}`);
  }
}
};
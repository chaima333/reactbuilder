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
    const { shouldVersion, oldPage, siteId, userId } = payload;
    if (!shouldVersion || !oldPage?.id) return;

    try {
      await PageVersionRepository.create({
        pageId: Number(oldPage.id),
        siteId: Number(siteId),
        title: oldPage.title,
        content: oldPage.content,
        blocks: oldPage.blocks,
        status: oldPage.status,
        createdBy: Number(userId)
      });
      console.log(`✅ [VersionPlugin]: Snapshot saved for page ${oldPage.id}`);
    } catch (err: any) {
      console.error("❌ Database Error in VersionPlugin:", err.message);
      throw err; // يوقّف الـ Execution لو فمة غلطة
    }
  }
};
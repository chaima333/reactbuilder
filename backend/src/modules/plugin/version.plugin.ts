import { ICmsPlugin } from "../../core/plugins/plugin.interface";
import { PAGE_EVENTS } from "../../core/plugins/events/pageEvents";

import { PageVersionRepository } from "../pages/repositories/pageVersion.repository"; // ثبت في الـ path


export const VersionPlugin: ICmsPlugin = {
  name: "version-plugin",
  events: [PAGE_EVENTS.UPDATED],
  priority: 100,
  mode: "sync",
  enabled: true,

  register({ eventBus }) {
    console.log("🔌 [VersionPlugin]: Ready for sync execution");
  },

  async execute(event: string, payload: any) {
    const { shouldVersion, oldPage, siteId, userId } = payload;

    if (!shouldVersion) return;

    console.log(`📜 [Plugin]: Creating snapshot for page: ${oldPage?.id}`);

    if (!oldPage?.id) {
      console.error("❌ Cannot create version: oldPage.id is missing!");
      return;
    }

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
      throw err; // نبعثوه للـ Engine باش يعرف اللي فمة مشكلة حرجة
    }
  }
};
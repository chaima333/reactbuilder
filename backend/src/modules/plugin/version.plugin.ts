import { ICmsPlugin } from "../../core/plugins/plugin.interface";
import { PAGE_EVENTS } from "../../core/plugins/events/pageEvents";
import { PageVersionRepository } from "../pages/repositories/pageVersion.repository";

export const VersionPlugin: ICmsPlugin = {
  name: "version-plugin",
  mode: "sync",
  priority: 100,
  events: [PAGE_EVENTS.UPDATED, PAGE_EVENTS.RESTORED], // 👈 يسمع الزوز توّة
  enabled: true,

  register() {
    console.log("🔌 [VersionPlugin]: Registered for sync snapshots");
  },

  async execute(event: string, payload: any) {
    const { oldPage, meta, action, siteId, userId } = payload; 

    // 🛡️ Logic الترقيع:
    // في الـ Restore، نحبو Snapshot توثق اللحظة اللي رجعنا فيها
    const versionTag = action === 'restore' 
      ? `restored_at_${Date.now()}` 
      : `v_${Date.now()}`;

    // الـ Snapshot تتسجل لو فمة content ولو الـ meta طلبت هذا (أو لو هو restore)
    const shouldSave = (meta?.shouldVersion || action === 'restore') && 
                     (oldPage?.content || (oldPage?.blocks && oldPage.blocks.length > 0));

    if (shouldSave) {
      await PageVersionRepository.create({
        pageId: oldPage.id,
        siteId: siteId,
        title: oldPage.title,
        content: oldPage.content,
        blocks: oldPage.blocks,
        createdBy: userId,
        versionTag: versionTag
      });
      console.log(`✅ [VersionPlugin]: Snapshot saved with tag: ${versionTag}`);
    }
  }
};
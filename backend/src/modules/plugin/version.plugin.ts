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

// 📂 src/modules/plugin/version.plugin.ts

async execute(event: string, payload: any) {
  // 1️⃣ استخراج الـ Context الجديد
  const { oldPage, meta, action } = payload; 

  // 🛡️ الـ Predictable Rule:
  // لو الـ Action هي Restore، ما نصنعوش Snapshot جديدة توّة (خاطرنا ديجا رجعنا نسخة قديمة)
  if (action === 'restore') {
     console.log("📸 [VersionPlugin]: Restore detected, skipping snapshot to avoid loops.");
     return;
  }

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
      versionTag: `v_${Date.now()}`
    });
    console.log(`✅ [VersionPlugin]: Clean Snapshot saved.`);
  }
}
};
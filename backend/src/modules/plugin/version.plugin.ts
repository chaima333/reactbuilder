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

// 📂 src/modules/plugins/version.plugin.ts

async execute(event: string, payload: any) {
  try {
    // 📥 1. نجبدو الداتا حسب الـ Contract الجديد
    const { oldPage, siteId, userId, meta } = payload;
    
    // نثبتو في الـ Meta (لو Meta مش موجودة، نعتبروها false)
    const shouldVersion = meta?.shouldVersion || false;
    const isRestored = meta?.restored || false;

    // 🛡️ 2. التحصين ضد الـ Garbage (الخردة)
    // ما نصوروش (Snapshot) لو:
    // - الـ meta قالت لا
    // - أو الـ oldPage ما جتناش أصلاً
    // - أو الـ oldPage فارغة (مافيهاش لا content لا blocks)
    if (!shouldVersion || !oldPage || (!oldPage.content && !oldPage.blocks)) {
      console.log(`⚠️ [VersionPlugin]: Snapshot skipped for page ${oldPage?.id || 'unknown'}`);
      return;
    }

    // 💾 3. تسجيل الـ Version
    await PageVersionRepository.create({
      pageId: oldPage.id,
      siteId: siteId,
      title: oldPage.title,
      content: oldPage.content,
      blocks: oldPage.blocks,
      createdBy: userId,
      // نزيدو ملاحظة لو كان الـ version هذي جاية من عملية restore
      versionTag: isRestored ? `restored_from_${meta.versionId}` : `v_${Date.now()}`
    });

    console.log(`✅ [VersionPlugin]: Full Snapshot saved for page ${oldPage.id} (Mode: ${isRestored ? 'Restore' : 'Update'})`);

  } catch (err: any) {
    console.error("❌ [VersionPlugin Critical Error]:", err.message);
  }
}
};
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
    // ✅ غيرنا الـ Log ليعكس الواقع الجديد: الـ Plugin أصبح Lean
    console.log("🔌 [VersionPlugin]: Registered for Clean Event Stream");
  },

  async execute(event: string, payload: any) {
    // 🛡️ الملاحظة: الـ _meta توّة جاية من الـ Bus كـ Trace فقط
    const { oldPage, meta, action, siteId, userId, _meta } = payload; 
    const eventId = _meta?.eventId || 'no-id';

    // 🎯 الـ Tag يبقى مفيد للـ Audit (التدقيق) باش نربط النسخة بالـ Event
    const shortId = eventId.slice(0, 8);
    const versionTag = action === 'restore' 
      ? `restored_ref_${shortId}` 
      : `v_ref_${shortId}`;

    // حساب هل يجب الحفظ؟ 
    // (إذا كانت هناك تغييرات تستحق، أو إذا كانت عملية Restore)
    const shouldSave = (meta?.shouldVersion || action === 'restore') && 
                       (oldPage?.content || (oldPage?.blocks && oldPage.blocks.length > 0));

    if (shouldSave) {
      // ✅ لا يوجد هنا أي check لـ "isAlreadyProcessed"
      // لأن الـ Single Source of Truth (Controller) ضمن لنا عدم التكرار
      await PageVersionRepository.create({
        pageId: oldPage.id,
        siteId: siteId,
        title: oldPage.title,
        content: oldPage.content,
        blocks: oldPage.blocks,
        createdBy: userId,
        versionTag: versionTag 
      });
      
      console.log(`✅ [VersionPlugin] Snapshot created: ${versionTag}`);
    }
  }
};
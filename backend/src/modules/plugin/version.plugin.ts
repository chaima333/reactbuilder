
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
    console.log("🔌 [VersionPlugin]: Registered with Idempotency Guard");
  },

  async execute(event: string, payload: any) {
    // 🛡️ ركز هوني: جبدنا الـ _meta اللي فيها الـ eventId والـ source
    const { oldPage, meta, action, siteId, userId, _meta } = payload; 
    const eventId = _meta?.eventId || 'no-id';

    // 🎯 توّة الـ Tag مابقاش تاريخ عشوائي، ولى مربوط بالـ ID متاع العملية
    // الـ slice(0, 8) فقط باش الـ Tag ما يكونش طويل برشة في الـ DB
    const shortId = eventId.slice(0, 8);
    const versionTag = action === 'restore' 
      ? `restored_ref_${shortId}` 
      : `v_ref_${shortId}`;

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
        versionTag: versionTag // 👈 هوني تضمن إنو الـ Action هذي توثقت مرة وحدة
      });
      
      console.log(`✅ [VersionPlugin] Snapshot locked with ID: ${versionTag}`);
    }
  }
};
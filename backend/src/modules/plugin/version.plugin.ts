import { PAGE_EVENTS } from "../../core/plugins/events/pageEvents";
import { ICmsPlugin } from "../../core/plugins/plugin.types";
import { PageVersionRepository } from "../pages/repositories/pageVersion.repository";

/**
 * VersionPlugin
 * دور الـ Plugin هذا توّة تقني بحت:
 * 1. يستقبل الـ Event النظيف من الـ Dispatcher.
 * 2. يعمل Snapshot (نسخة احتياطية) للـ Page قبل التعديل.
 * 3. يربط النسخة بـ Tag موحد (correlation ID) للتدقيق.
 */
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
    const { oldPage, meta, action, siteId, userId, _meta } = payload;
    
    // الـ EventId جاي من الـ Dispatcher كـ Single Source of Truth
    const eventId = _meta?.eventId || 'no-id';
    const shortId = eventId.slice(0, 8);

    // بناء الـ Version Tag لسهولة البحث والـ Rollback
    const versionTag = action === 'restore' 
      ? `restored_ref_${shortId}` 
      : `v_ref_${shortId}`;

    /**
     * شروط الحفظ:
     * - الـ Engine قرر إنو لازم Version (تغيير محتوى حقيقي).
     * - أو العملية هي Restore (باش نوثقوا الحالة اللي رجعنا منها).
     * - والتأكد إنو الـ Page القديمة فيها محتوى باش ما نسجلوش "فراغ".
     */
    const shouldSave = (meta?.shouldVersion || action === 'restore') && 
                       (oldPage?.content || (oldPage?.blocks && oldPage.blocks.length > 0));

    if (shouldSave) {
      try {
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
      } catch (error) {
        console.error(`❌ [VersionPlugin] Failed to save snapshot:`, error);
        // بما أن الـ Plugin هو isCritical، الخطأ هنا سيتم التعامل معه في الـ Bus
        throw error;
      }
    }
  }
};
import { Plugin } from "../../core/plugins/plugin.interface";
import { PAGE_EVENTS } from "../../core/plugins/events/pageEvents";

import { PageVersionRepository } from "../pages/repositories/pageVersion.repository"; // ثبت في الـ path

export const VersionPlugin: Plugin = {
  name: "version-plugin",
  events: [PAGE_EVENTS.UPDATED],
  priority: 10,
  enabled: true,

  register({ eventBus }) {
    const handler = async (payload: any) => {
  const { shouldVersion, oldPage, siteId, userId } = payload;
  
  if (shouldVersion) {
    console.log(`📜 [Plugin]: Creating snapshot for page: ${oldPage?.id}`);
    
    // 🔥 تثبّت إنو oldPage موجود وعندو ID
    if (!oldPage?.id) {
      console.error("❌ Cannot create version: oldPage.id is missing!", oldPage);
      return;
    }

    try {
      await PageVersionRepository.create({
        pageId: Number(oldPage.id), // تأكد إنو الاسم 'id' موش '_id'
        siteId: Number(siteId),
        title: oldPage.title,
        content: oldPage.content,
        blocks: oldPage.blocks,
        status: oldPage.status,
        createdBy: Number(userId)
      });
    } catch (err: any) {
      console.error("❌ Database Error in VersionPlugin:", err.message);
      // ما تعملش throw err هوني باش ما يطيّحش السيرفر كامل
    }
  }
};
    (handler as any).pluginName = this.name;
    eventBus.on(PAGE_EVENTS.UPDATED, handler);
  }
  // 💡 لاحظ: ما فماش ميثود execute هوني، باش الـ Registry ما يبعثوش للـ Queue
};
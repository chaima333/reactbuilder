import { Plugin } from "../../core/plugins/plugin.interface";
import { PAGE_EVENTS } from "../../core/plugins/events/pageEvents";

import { PageVersionRepository } from "../pages/repositories/pageVersion.repository"; // ثبت في الـ path

export const VersionPlugin: Plugin = {
  name: "version-plugin",
  events: [PAGE_EVENTS.UPDATED],
  priority: 10,
  enabled: true,


register({ eventBus }) {
  eventBus.on(PAGE_EVENTS.UPDATED, async (payload) => {
    // 🔥 لهنا المشكلة: لازم تزيد siteId و userId في السطر هذا
    const { shouldVersion, oldPage, siteId, userId } = payload; 
    
    if (shouldVersion) {
      console.log("📜 [Plugin]: Creating snapshot...");
      await PageVersionRepository.create({
        pageId: oldPage.id,
        title: oldPage.title,
        siteId: siteId,     
        content: oldPage.content,
        blocks: oldPage.blocks,
        status: oldPage.status,
        createdBy: userId    
      });
    }
  });
}
};
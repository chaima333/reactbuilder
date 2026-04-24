import { Plugin } from "../../core/plugins/plugin.interface";
import { PAGE_EVENTS } from "../../core/plugins/events/pageEvents";

import { PageVersionRepository } from "../pages/repositories/pageVersion.repository"; // ثبت في الـ path

export const VersionPlugin: Plugin = {
  name: "version-plugin",
  events: [PAGE_EVENTS.UPDATED],
  priority: 10,
  enabled: true,


register({ eventBus }) {
  // 📂 src/modules/plugin/version.plugin.ts

eventBus.on(PAGE_EVENTS.UPDATED, async (payload) => {
  // 1. ثبت هل الـ payload فيه القيم هاذم بالرسمي؟
  const { shouldVersion, oldPage, siteId, userId } = payload; 
  
  if (shouldVersion) {
    console.log("📜 [Plugin]: Creating snapshot for site:", siteId, "by user:", userId);

    try {
      await PageVersionRepository.create({
        pageId: Number(oldPage.id), // تأكد إنو رقم
        siteId: Number(siteId),     // 🔥 لو الـ siteId جاي undefined يولي NaN ويخرجلك الـ Error
        title: oldPage.title,
        content: oldPage.content,
        blocks: oldPage.blocks,
        status: oldPage.status,
        createdBy: Number(userId)   // 🔥 لو الـ userId جاي undefined يولي NaN
      });
      console.log("✅ [Plugin]: Snapshot saved successfully!");
    } catch (err) {
      console.error("❌ [Plugin Error]:", err.message);
    }
  }
});
}
};
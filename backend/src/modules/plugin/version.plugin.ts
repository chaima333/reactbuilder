import { Plugin } from "../../core/plugins/plugin.interface";
import { PAGE_EVENTS } from "../../core/plugins/events/pageEvents";

import { PageVersionRepository } from "../pages/repositories/pageVersion.repository"; // ثبت في الـ path

export const VersionPlugin: Plugin = {
  name: "version-plugin",
  events: [PAGE_EVENTS.UPDATED],
  priority: 10,
  enabled: true,


register({ eventBus }) {
  // 1. نعرّفو الـ Handler في Function وحدها
  const handler = async (payload: any) => {
    console.log(`🔍 [SEO Plugin]: Analyzing content...`);
    
    const { shouldVersion, oldPage, siteId, userId } = payload;
    
    if (shouldVersion) {
      console.log(`📜 [Plugin]: Creating snapshot for site: ${siteId}`);
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
        // ملاحظة: الـ Log متاع النجاح توّة باش يولي يظهر معاه الوقت في الـ Registry
      } catch (err: any) {
        throw err; // نبعثو الـ error للفوق باش الـ emitSafe يفيق بيه
      }
    }
  };

  // 2. 🔥 أهم سطر: نلصقو اسم الـ Plugin في الـ Handler
  (handler as any).pluginName = this.name;

  // 3. نربطو الـ Handler بالـ EventBus
  eventBus.on(PAGE_EVENTS.UPDATED, handler);
}
};
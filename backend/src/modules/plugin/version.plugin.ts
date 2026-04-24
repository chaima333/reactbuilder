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
        console.log(`📜 [Sync] Creating snapshot for site: ${siteId}`);
        await PageVersionRepository.create({ /* ... data ... */ });
      }
    };
    (handler as any).pluginName = this.name;
    eventBus.on(PAGE_EVENTS.UPDATED, handler);
  }
  // 💡 لاحظ: ما فماش ميثود execute هوني، باش الـ Registry ما يبعثوش للـ Queue
};
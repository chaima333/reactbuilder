import { Plugin } from "../../core/plugins/plugin.interface";
import { PAGE_EVENTS } from "../../core/plugins/events/pageEvents";

export const SEOPlugin: Plugin = {
  name: "seo-plugin",
  events: [PAGE_EVENTS.UPDATED],
  priority: 5,
  enabled: true,

  register({ eventBus }) {
    // 1. تعريف الـ handler كمتغيّر منفصل
    const handler = async ({ page }: any) => {
      console.log(`🔍 [SEO Plugin]: Analyzing content for page: ${page.title}`);
      // الـ Logic متاعك هنا (Sitemap, Metadata, etc.)
    };

    // 2. 🔥 ربط الهوية: لصّق اسم الـ Plugin في الـ handler
    (handler as any).pluginName = this.name;

    // 3. التسجيل في الـ Event Bus
    eventBus.on(PAGE_EVENTS.UPDATED, handler);
  }
};
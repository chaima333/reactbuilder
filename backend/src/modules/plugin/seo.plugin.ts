import { Plugin } from "../../core/plugins/plugin.interface";
import { PAGE_EVENTS } from "../../core/plugins/events/pageEvents";

export const SEOPlugin: Plugin = {
  name: "seo-plugin",
  events: [PAGE_EVENTS.UPDATED],
  priority: 5,
  enabled: true,

  register({ eventBus }) {
    eventBus.on(PAGE_EVENTS.UPDATED, async ({ page }) => {
      console.log(`🔍 [SEO Plugin]: Analyzing content for page: ${page.title}`);
      // هنا تزيد الـ Logic متاع الـ Sitemap أو الـ Meta Tags
    });
  }
};
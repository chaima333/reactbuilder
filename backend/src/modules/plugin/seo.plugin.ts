import { ICmsPlugin } from "../../core/plugins/plugin.interface";
import { PAGE_EVENTS } from "../../core/plugins/events/pageEvents";

export const SEOPlugin: ICmsPlugin = {
  name: "seo-plugin",
  mode: "async",
  priority: 50,
  events: [PAGE_EVENTS.UPDATED],
  enabled: true,

  register() {
    console.log("🔌 [SEOPlugin]: Registered for async analysis");
  },

  async execute(event, { page }: any) {
    console.log(`🔍 [Worker] SEO Analyzing: ${page.title}`);
    // Logic الـ SEO هنا
  }
};
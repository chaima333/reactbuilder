import { Plugin } from "../../core/plugins/plugin.interface";
import { PAGE_EVENTS } from "../../core/plugins/events/pageEvents";

export const SEOPlugin: Plugin = {
  name: "seo-plugin",
  events: [PAGE_EVENTS.UPDATED],
  priority: 5,
  enabled: true,

  // الخدمة الثقيلة هنا بركة
  async execute(event, { page }: any) {
    console.log(`🔍 [Worker] SEO Analyzing: ${page.title}`);
  },

  register({ eventBus }) {
    // الـ register تفرغ، خاطر الـ Registry هو اللي باش يتكفل بالـ Queue
    console.log(`🔌 SEO Plugin ready for background tasks`);
  }
};
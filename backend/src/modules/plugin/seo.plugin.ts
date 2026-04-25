import { PAGE_EVENTS } from "../../core/plugins/events/pageEvents";
import { ICmsPlugin } from "../../core/plugins/plugin.types";

export const SEOPlugin: ICmsPlugin = {
  name: "seo-plugin",
  events: [PAGE_EVENTS.UPDATED],
  priority: 50,
  mode: "async",
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
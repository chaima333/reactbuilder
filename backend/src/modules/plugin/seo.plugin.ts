import { Plugin } from "../../core/plugins/plugin.interface";
import { PAGE_EVENTS } from "../../core/plugins/events/pageEvents";

export const SEOPlugin: Plugin = {
  name: "seo-plugin",
  events: [PAGE_EVENTS.UPDATED], // توّة الـ Error هذا باش يتنحى
  priority: 5,
  enabled: true,

  // 🔥 ميثود الـ Execute هي اللي باش يناديها الـ Worker لاحقاً
  async execute(event, { page }: any) {
    console.log(`🔍 [SEO Plugin]: Analyzing content for page: ${page.title}`);
    // الـ Logic متاعك هنا
  },

  register({ eventBus }) {
    const handler = async (payload: any) => {
      // نعيطو للـ execute مباشرة
      await this.execute!(PAGE_EVENTS.UPDATED, payload);
    };

    (handler as any).pluginName = this.name;
    eventBus.on(PAGE_EVENTS.UPDATED, handler);
  }
};
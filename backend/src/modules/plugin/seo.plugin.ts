import { ICmsPlugin } from "../../core/plugins/plugin.interface";
import { PAGE_EVENTS } from "../../core/plugins/events/pageEvents";

export const SEOPlugin: ICmsPlugin = {
  name: "seo-plugin",
  mode: "async",
  priority: 50,
  events: [PAGE_EVENTS.UPDATED, PAGE_EVENTS.RESTORED], // يسمع الزوز توّة ✅
  enabled: true,

  register() {
    console.log("🔌 [SEOPlugin]: Registered for async analysis");
  },

  async execute(event: string, payload: any) {
    // 🛡️ التثبيت من الـ Payload: 
    // نلوجو على الداتا في current (الـ Contract الجديد) أو page (القديم)
    const targetPage = payload.current || payload.page;

    if (!targetPage) {
      console.error(`⚠️ [SEO-Worker]: No page data found in payload for event ${event}`);
      return;
    }

    console.log(`🔍 [SEO-Worker] Analyzing ${event} for: ${targetPage.title}`);

    // هوني تحط الـ Logic متاعك (مثلاً طلب AI أو تحديث جداول الـ SEO)
    // Example: await analyzeSEO(targetPage.content);
  }
};
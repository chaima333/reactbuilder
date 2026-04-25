import { PAGE_EVENTS } from "../../core/plugins/events/pageEvents";
import { ICmsPlugin } from "../../core/plugins/plugin.types"; // زدت حرف الـ S في لخر باش يقرأ الملف الصحيح

export const SEOPlugin: ICmsPlugin = {
  name: "seo-plugin",
  mode: "async",
  priority: 50,
  isCritical: false,
  events: [PAGE_EVENTS.UPDATED, PAGE_EVENTS.RESTORED],
  enabled: true,

  register() {
    console.log("🔌 [SEOPlugin]: Registered for async analysis");
  },

  // 1️⃣ نقبلو الـ payload كامل كـ Object واحد باش ما يصيرش Crash في الـ Destructuring
  async execute(event: string, payload: any) {
    
    // 2️⃣ نلوجو على الداتا وين ما كانت (Contract القديم أو الجديد)
    // نثبتو في payload.current (الجديد) أو payload.page (القديم) أو الـ payload بيدو لو مبعوث غالط
    const targetPage = payload?.current || payload?.page || payload;

    // 3️⃣ الحماية القصوى (Failsafe)
    if (!targetPage || !targetPage.title) {
      console.error(`⚠️ [SEO-Worker] Missing Data: Payload structure is not recognized.`, payload);
      return; 
    }

    console.log(`🔍 [SEO-Worker] Analyzing ${event} for: ${targetPage.title}`);

   
  }
};
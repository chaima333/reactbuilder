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

 // inside SEOPlugin.ts
async execute(event: string, payload: any) {
  // يقرأ مالـ newPage إذا موجودة، وإلا مالـ payload طول
  const data = payload.newPage || payload; 
  
  if (!data.title || !data.content) {
    console.warn(`⚠️ [SEO-Worker] Missing Data:`, payload);
    return;
  }
  // ... بقية الـ logic
}
};
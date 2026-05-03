import { ICmsPlugin } from "../../core/plugins/plugin.types";
import { UnifiedEvent } from "../../core/plugins/events/contracts/pageUpdated.event"; // استورد النوع الموحد


export const SEOPlugin: ICmsPlugin = {
  name: "seo-plugin",
  mode: "async",
  priority: 50,
  isCritical: false,
  events: ["page.updated", "page.restored"],
  enabled: true,

  async execute(event: UnifiedEvent) {
    // 🎯 اقتناص البيانات من العقد الجديد
    const { data, context, id } = event;
    const { current, flags } = data;

    // 🛑 التثبت من الـ ID (الآن هو event.id)
    if (!id) {
      console.error("🚨 SEOPlugin: Identifiant d'événement manquant");
      return;
    }

    // 🚦 التثبت من الـ Flags
    if (!flags?.shouldSEO) {
      return;
    }

    if (!current?.title) {
      console.log("🟡 SEO skipped: missing title");
      return;
    }

    console.log(`🔍 SEO processing: ${current.title} | Event ID: ${id}`);
  }
};
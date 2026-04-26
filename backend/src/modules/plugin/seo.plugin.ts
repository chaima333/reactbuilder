import { ICmsPlugin } from "../../core/plugins/plugin.types";


export const SEOPlugin: ICmsPlugin = {
  name: "seo-plugin",
  mode: "async",
  priority: 50,
  isCritical: false,
  events: ["page.updated", "page.restored"],
  enabled: true,

  async execute(event, payload) {
    // 🎯 اقتناص البيانات مباشرة من الـ Contract الجديد
    const { current, context, flags } = payload;

    // 🛑 التثبت من الـ ID (باش ما يطلّعش Error)
    if (!context?.eventId) {
      console.error("🚨 SEOPlugin: Identifiant d'événement manquant");
      return;
    }

    // 🚦 التثبت من الـ Flag اللي بعثناه من السيرفس
    if (!flags?.shouldSEO) {
      // console.log("🟡 SEO skipped: No title change");
      return;
    }

    if (!current?.title) {
      console.log("🟡 SEO skipped: missing title");
      return;
    }

    console.log(`🔍 SEO processing: ${current.title} | Event: ${context.eventId}`);
  }
};
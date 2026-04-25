import { ICmsPlugin } from "../../core/plugins/plugin.types";

export const SEOPlugin: ICmsPlugin = {
  name: "seo-plugin",
  mode: "async",
  priority: 50,
  isCritical: false,
  events: ["page.updated", "page.restored"],
  enabled: true,

  register() {
    console.log("🔌 SEOPlugin ready");
  },

  async execute(event: string, payload: any) {
    const data = payload.current; // 👈 fixed contract

    if (!data?.title || !data?.content) {
      console.warn("⚠️ SEO skip: invalid payload");
      return;
    }

    console.log("🔍 SEO processing:", data.title);
  }
};
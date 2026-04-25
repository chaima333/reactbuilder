import { ICmsPlugin } from "../../core/plugins/plugin.interface";

export const SEOPlugin: ICmsPlugin = {
  name: "seo-plugin",
  mode: "async",
  priority: 50,
  events: ["page.updated", "page.restored"],
  enabled: true,

  async execute(event, payload) {
    const data = payload.current;

    if (!data?.title || !data?.content) return;

    console.log("🔍 SEO:", data.title);
  }
};
import { ICmsPlugin } from "../../core/plugins/plugin.types";


export const SEOPlugin: ICmsPlugin = {
  name: "seo-plugin",
  mode: "async",
  priority: 50,
  isCritical: false,
  events: ["page.updated", "page.restored"],
  enabled: true,

  async execute(event, payload) {
    const { data, flags } = payload;

    const current = data?.current;

    if (!flags?.shouldSEO) return;
    if (!current?.title || !current?.content) return;

    console.log("🔍 SEO processing:", current.title);
  }
};
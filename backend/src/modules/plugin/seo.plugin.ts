import { ICmsPlugin } from "../../core/plugins/plugin.types";


export const SEOPlugin: ICmsPlugin = {
  name: "seo-plugin",
  mode: "async",
  priority: 50,
  isCritical: false,
  events: ["page.updated", "page.restored"],
  enabled: true,

  async execute(event, payload) {
    const current =
      payload?.data?.current ||
      payload?.current ||
      payload?.page;

    const previous =
      payload?.data?.previous ||
      payload?.previous;

    const flags = payload?.flags;

    if (!flags?.shouldSEO) return;

    if (!current?.title || !current?.content) {
      console.log("🟡 SEO skipped: missing data");
      return;
    }

    console.log("🔍 SEO processing:", current.title);
  }
};
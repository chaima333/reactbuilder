import { ICmsPlugin } from "../../core/plugins/plugin.types";

export const SEOPlugin: ICmsPlugin = {
  name: "seo-plugin",
  mode: "async",
  priority: 50,
  isCritical: false,
  events: ["page.updated", "page.restored"],
  enabled: true,

  async execute(event, payload) {
    const current = payload?.current;
    const flags = payload?.flags;

    // 🔥 IMPORTANT GUARD
    if (!flags?.shouldSEO) {
      console.log("🟡 SEO skipped (no real change)");
      return;
    }

    if (!current?.title || !current?.content) {
      console.warn("⚠️ SEO skip: invalid payload");
      return;
    }

    console.log("🔍 SEO processing:", current.title);
  }
};
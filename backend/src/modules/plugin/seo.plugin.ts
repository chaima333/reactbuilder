import { ICmsPlugin } from "../../core/plugins/plugin.types";

export const SEOPlugin: ICmsPlugin = {
  name: "seo-plugin",
  mode: "async",
  priority: 50,
  isCritical: true,
  events: ["page.updated", "page.restored"],
  enabled: true,

  async execute(event, payload) {
  const current = payload.current;

  if (!current?.title || !current?.content) {
    console.warn("⚠️ SEO skip: invalid payload");
    return;
  }

  console.log("🔍 SEO processing:", current.title);
}
};
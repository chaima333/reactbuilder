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
    const previous = data?.previous;
    const hasSEOImpact =
  current.title !== previous.title ||
  current.content !== previous.content;

if (!hasSEOImpact) return;

    if (!flags?.shouldSEO) return;
    if (!current?.title || !current?.content) return;

    console.log("🔍 SEO processing:", current.title);
  }
};
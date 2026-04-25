import { PAGE_EVENTS } from "../../core/plugins/events/pageEvents";
import { ICmsPlugin } from "../../core/plugins/plugin.types";

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

  async execute(event: string, payload: any) {
    const page = payload?.data?.new;

    if (!page) {
      console.warn("⚠️ [SEO] Invalid payload structure:", payload?._meta?.eventId);
      return;
    }

    if (!page.title || !page.content) {
      console.warn("⚠️ [SEO] Missing SEO fields:", {
        id: page.id,
        event: event
      });
      return;
    }

    // ======================
    // SEO LOGIC CORE
    // ======================

    const seoTitle = `${page.title} | My App`;
    const slug = page.slug;

    console.log("🔍 [SEO] Processing page:", {
      id: page.id,
      title: seoTitle,
      slug
    });

    // simulate async work
    await new Promise((r) => setTimeout(r, 50));

    console.log("✅ [SEO] Done:", page.id);
  }
};
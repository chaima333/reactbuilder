import { Page } from "../../../models";
import PageSlug from "../../../models/pageSlug";
import { SlugResolveResult } from "../types/page.types";

export class SlugResolver {
  static async resolve(siteId: number, slug: string): Promise<SlugResolveResult> {
    if (!slug) return { type: "not_found", reason: "missing_slug" };

    // ✅ 1. Check current published page
    const page = await Page.findOne({
      where: { siteId, slug, status: "published" }
    });

    if (page) return { type: "page", data: page };

    // ✅ 2. Check history with Eager Loading (Optimization)
    const history = await PageSlug.findOne({
      where: { siteId, slug },
      include: [{
        model: Page,
        as: 'page', // تأكد إنّ الـ Alias صحيحة في الـ Association متاعك
        attributes: ['slug', 'status']
      }]
    });

    // 🛡️ Logic الـ Redirect الذكي
    if (history && history.page) {
      const targetSlug = history.page.slug;

      // تثبّت إنّ الصفحة منشورة وماهيش قاعدة تريكتي لروحها
      if (history.page.status === "published" && targetSlug !== slug) {
        return {
          type: "redirect",
          to: targetSlug,
          status: 301 // SEO Standard
        };
      }
    }

    return { type: "not_found", reason: "no_match" };
  }
}
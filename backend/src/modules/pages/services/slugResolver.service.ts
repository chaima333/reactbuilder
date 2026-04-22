
import { Page } from "../../../models";
import PageSlug from "../../../models/pageSlug";

export class SlugResolver {
  static async resolve(siteId: number, slug: string) {
    // 🛑 Guard 1: إذا الـ slug فارغ، اخرج طول
    if (!slug || slug === 'undefined') {
      return { type: "not_found" };
    }

    // 1. history FIRST (SEO priority)
    const history = await PageSlug.findOne({
      where: { siteId, slug }
    });

    if (history) {
      const current = await Page.findByPk(history.pageId);
      // تأكد إنو الـ Redirect ما يمشيش لنفس الـ slug (تجنب الـ Loop)
      if (current && current.status === "published" && current.slug !== slug) {
        return { type: "redirect", to: current.slug };
      }
    }

    // 2. current page SECOND
    const page = await Page.findOne({
      where: { siteId, slug, status: "published" }
    });

    if (page) {
      return { type: "page", data: page };
    }

    return { type: "not_found" };
  }
}
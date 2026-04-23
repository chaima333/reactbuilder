import { Page } from "../../../models";
import PageSlug from "../../../models/pageSlug";
import { SlugResolveResult } from "../types/page.types";

export class SlugResolver {

  static async resolve(siteId: number, slug: string): Promise<SlugResolveResult> {

    if (!slug) {
      return {
        type: "not_found",
        reason: "missing_slug"
      };
    }

    // ✅ 1. check current published page
    const page = await Page.findOne({
      where: { siteId, slug, status: "published" }
    });

    if (page) {
      return {
        type: "page",
        data: page
      };
    }

    // ✅ 2. check slug history
    const history = await PageSlug.findOne({
      where: { siteId, slug }
    });

    if (history) {
      const currentPage = await Page.findByPk(history.pageId);

      if (currentPage && currentPage.status === "published") {
        return {
          type: "redirect",
          to: currentPage.slug
        };
      }
    }

    // ❌ 3. not found
    return {
      type: "not_found",
      reason: "no_match"
    };
  }
}
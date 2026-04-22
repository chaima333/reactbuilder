import { Page } from "../../../models";
import PageSlug from "../../../models/pageSlug";

export class SlugResolver {

  static async resolve(siteId: number, slug: string) {
    if (!slug) {
      return { type: "not_found", reason: "missing_slug" };
    }

    console.log("🔍 Resolving:", { siteId, slug });

    // 1. current published page
    const page = await Page.findOne({
      where: {
        siteId,
        slug,
        status: "published"
      }
    });

    if (page) {
      return {
        type: "page",
        data: page
      };
    }

    // 2. check history (redirect)
    const history = await PageSlug.findOne({
      where: { siteId, slug }
    });

    if (history) {
      const current = await Page.findByPk(history.pageId);

      if (current && current.status === "published") {
        return {
          type: "redirect",
          to: current.slug
        };
      }
    }

    return {
      type: "not_found",
      reason: "no_page_or_redirect"
    };
  }
}
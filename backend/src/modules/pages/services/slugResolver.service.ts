import { Page } from "../../../models";
import PageSlug from "../../../models/pageSlug";

export class SlugResolver {

  static async resolve(siteId: number, slug: string) {

    // 1. HISTORY FIRST
    const history = await PageSlug.findOne({
      where: { siteId, slug }
    });

    if (history) {
      const page = await Page.findByPk(history.pageId);

      if (page && page.status === "published") {

        // منع loop
        if (page.slug === slug) {
          return { type: "page", data: page };
        }

        return {
          type: "redirect",
          to: page.slug
        };
      }
    }

    // 2. CURRENT PAGE
    const page = await Page.findOne({
      where: { siteId, slug, status: "published" }
    });

    if (page) {
      return { type: "page", data: page };
    }

    return { type: "not_found" };
  }
}

import { Page } from "../../../models";
import PageSlug from "../../../models/pageSlug";

export class SlugResolver {

  static async resolve(siteId: number, slug: string) {

    // 1. current canonical page FIRST
    const page = await Page.findOne({
      where: { siteId, slug, status: "published" }
    });

    if (page) {
      return { type: "page", data: page };
    }

    // 2. history lookup ONLY if current not found
    const history = await PageSlug.findOne({
      where: { siteId, slug }
    });

    if (history) {
      const current = await Page.findByPk(history.pageId);

      // safety check
      if (current && current.status === "published") {
        return {
          type: "redirect",
          to: current.slug
        };
      }
    }

    return { type: "not_found" };
  }
}
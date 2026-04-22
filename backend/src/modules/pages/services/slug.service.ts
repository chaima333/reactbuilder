import { Page } from "../../../models";
import PageSlug from "../../../models/pageSlug";

export class SlugResolver {
  static async resolve(siteId: number, slug: string) {

    if (!slug || slug === "undefined") {
      return { type: "not_found" };
    }

    // 1. current FIRST (source of truth)
    const page = await Page.findOne({
      where: { siteId, slug, status: "published" }
    });

    if (page) {
      return { type: "page", data: page };
    }

    // 2. history SECOND
    const history = await PageSlug.findOne({
      where: { siteId, slug }
    });

    if (history) {
      const current = await Page.findOne({
        where: {
          id: history.pageId,
          siteId,
          status: "published"
        }
      });

      if (current && current.slug !== slug) {
        return { type: "redirect", to: current.slug };
      }
    }

    return { type: "not_found" };
  }
}
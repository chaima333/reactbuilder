import { Page } from "../../../models";
import PageSlug from "../../../models/pageSlug";
import { SlugResult } from "../types/page.types";

export class SlugResolver {

  static async resolve(siteId: number, slug: string): Promise<SlugResult> {

    if (!slug) {
      return { type: "not_found" };
    }

    // 1. page published
    const page = await Page.findOne({
      where: { siteId, slug, status: "published" }
    });

    if (page) {
      return {
        type: "page",
        data: page
      };
    }

    // 2. slug history → redirect
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

    // 3. not found
    return { type: "not_found" };
  }
}
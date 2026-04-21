import { Page } from "../../../models";
import PageSlug from "../../../models/pageSlug";

export class SlugResolver {

  static async resolve(siteId: number, slug: string) {

    // 1. نبحث في history FIRST (الأهم)
    const history = await PageSlug.findOne({
      where: { siteId, slug }
    });

    if (history) {
      const page = await Page.findByPk(history.pageId);

      if (page && page.status === "published") {
        return {
          type: "redirect",
          to: page.slug
        };
      }
    }

    // 2. بعدها فقط current slug
    const page = await Page.findOne({
      where: { siteId, slug, status: "published" }
    });

    if (page) {
      return {
        type: "page",
        data: page
      };
    }

    return { type: "not_found" };
  }
}
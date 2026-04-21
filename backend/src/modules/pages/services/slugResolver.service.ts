
import { Page } from "../../../models";
import PageSlug from "../../../models/pageSlug";

export class SlugResolver {

  static async resolve(siteId: number, slug: string) {

  // 1. history FIRST (important for SEO redirect)
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
import { Page } from "../../../models/page";
import PageSlug from "../../../models/pageSlug";

export class SlugResolver {

  static async resolve(siteId: number, slug: string) {

    // 1. current page (ONLY published)
    const page = await Page.findOne({
      where: { siteId, slug, status: "published" }
    });

    if (page) {
      return {
        type: "page",
        data: page,
        canonical: page.slug
      };
    }

    // 2. history lookup
    const history = await PageSlug.findOne({
      where: { siteId, slug }
    });

    if (!history) {
      return { type: "not_found" };
    }

    // 3. target page
    const target = await Page.findByPk(history.pageId);

    if (!target || target.status !== "published") {
      return { type: "not_found" };
    }

    // 4. redirect
    return {
      type: "redirect",
      to: target.slug,
      canonical: target.slug
    };
  }
}
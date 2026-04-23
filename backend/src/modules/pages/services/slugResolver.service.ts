import { Page } from "../../../models/page";
import PageSlug from "../../../models/pageSlug";

export class SlugResolver {
  static async resolve(siteId: number, slug: string) {

    const page = await Page.findOne({
      where: { siteId, slug, status: "published" }
    });

    if (page) {
      return { kind: "page", page };
    }

    const history = await PageSlug.findOne({
      where: { siteId, slug }
    });

    if (!history) {
      return { kind: "not_found" };
    }

    const target = await Page.findByPk(history.pageId);

    if (!target || target.status !== "published") {
      return { kind: "not_found" };
    }

    return {
      kind: "redirect",
      targetSlug: target.slug,
      siteId
    };
  }
}
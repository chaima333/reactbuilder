import { Page } from "../../../models";
import { SlugMap } from "../../../models/slug_map";


export class SlugResolver {

  static async resolve(siteId: number, slug: string) {

    const record = await SlugMap.findOne({
      where: { siteId, slug }
    });

    if (!record) {
      return { type: "not_found" };
    }

    const page = await Page.findByPk(record.pageId);

    if (!page || page.status !== "published") {
      return { type: "not_found" };
    }

    // page exists
    if (page.slug === slug) {
      return {
        type: "page",
        data: page,
        canonical: page.slug,
        siteId
      };
    }

    // redirect case
    return {
      type: "redirect",
      to: page.slug,
      siteId
    };
  }
}
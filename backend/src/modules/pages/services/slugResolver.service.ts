import { Page } from "../../../models/page";
import { SlugMap } from "../../../models/slug_map";

export class SlugResolver {

  static async resolve(siteId: number, slug: string) {

    const record = await SlugMap.findOne({
      where: { siteId, slug }
    });

    if (!record) return { type: "not_found" };

    const page = await Page.findByPk(record.pageId);

    if (!page || page.status !== "published") {
      return { type: "not_found" };
    }

    if (record.type === "page") {
      return {
        type: "page",
        data: page
      };
    }

    return {
      type: "redirect",
      to: record.redirectTo || page.slug
    };
  }
}
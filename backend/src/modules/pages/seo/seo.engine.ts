import { Page } from "../../../models";
import PageSlug from "../../../models/pageSlug";
import { SEOBuilder } from "./seo.builder";
import { SEOResult } from "./seo.types";

export class SEOEngine {

  static async resolve(siteId: number, slug: string): Promise<SEOResult> {

    if (!slug) return { type: "not_found" };

    // 1. active page
    const page = await Page.findOne({
      where: { siteId, slug }
    });

    if (page && page.status === "published") {
      return {
        type: "page",
        page,
        seo: SEOBuilder.build(page)
      };
    }

    // 2. history redirect
    const history = await PageSlug.findOne({
      where: { siteId, slug }
    });

    if (history) {
      const current = await Page.findByPk(history.pageId);

      if (current?.status === "published") {
        return {
          type: "redirect",
          to: current.slug
        };
      }
    }

    return { type: "not_found" };
  }
}
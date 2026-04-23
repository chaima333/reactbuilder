import { Page } from "../../../models";
import { RedirectGraphEngine } from "../engine/redirectGraph.engine";
import { SlugResolveResult } from "../types/page.types";

export class SlugResolver {

  static async resolve(siteId: number, inputSlug: string): Promise<SlugResolveResult> {

    const pageId = await RedirectGraphEngine.resolveFinalPageId(siteId, inputSlug);

    if (!pageId) {
      return {
        type: "not_found",
        reason: "no_match"
      };
    }

    const page = await Page.findByPk(pageId);

    if (!page || page.status !== "published") {
      return {
        type: "not_found",
        reason: "not_published"
      };
    }

    // ✅ canonical decision (مرة وحدة فقط)
    if (page.slug === inputSlug) {
      return {
        type: "page",
        data: page,
        canonical: page.slug
      };
    }

    return {
      type: "redirect",
      to: page.slug,
      canonical: page.slug,
      reason: "slug_moved"
    };
  }
}
import { Page } from "../../../models";
import { RedirectGraphEngine } from "../engine/redirectGraph.engine";
import {SlugResolveResult} from "../types/page.types";

export class SlugResolver {

  static async resolve(siteId: number, slug: string): Promise<SlugResolveResult> {
    
    const finalResult = await RedirectGraphEngine.resolveFinalSlug(siteId, slug);

    if (!finalResult) {
      return { type: "not_found", reason: "slug_not_found" };
    }

    const page = await Page.findByPk(finalResult.pageId);

    if (!page || page.status !== "published") {
      return { type: "not_found", reason: "target_inactive" };
    }

    if (page.slug === slug) {
      return { type: "page", data: page, canonical: page.slug };
    }

// =========================
    // 4. REDIRECT RESULT
    // =========================
    return { 
      type: "redirect", 
      to: page.slug, 
      reason: "slug_moved",
      canonical: page.slug, 
      trace: {
        step: "redirect_resolved",
        inputSlug: slug,
        targetSlug: page.slug
      }
    };
  
  }
}

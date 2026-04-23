import { Page } from "../../../models";
import { RedirectGraphEngine } from "../engine/redirectGraph.engine";
import {SlugResolveResult} from "../types/page.types";

// slugResolver.service.ts
export class SlugResolver {
  static async resolve(siteId: number, inputSlug: string): Promise<SlugResolveResult> {
    
    // 🔥 المصدر الوحيد للحقيقة
    const result = await RedirectGraphEngine.resolve(siteId, inputSlug);

    if (!result) {
      return { type: "not_found", reason: "no_match_in_graph" };
    }

    // نجيبو الداتا كاملة مرة وحدة بالـ ID (أسرع وأضمن)
    const page = await Page.findByPk(result.pageId);
    if (!page) return { type: "not_found", reason: "page_deleted" };

    // القرار توّة ساهل وما فيهش شك
    if (page.slug === inputSlug) {
      return { type: "page", data: page, canonical: page.slug };
    }

    return { 
      type: "redirect", 
      to: page.slug, 
      canonical: page.slug, 
      reason: "moved_to_final_target" 
    };
  }
}

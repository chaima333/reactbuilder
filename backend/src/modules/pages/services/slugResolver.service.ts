import { Page } from "../../../models/page";
import PageSlug from "../../../models/pageSlug";
import { RedirectGraphEngine } from "../engine/redirectGraph.engine";

export class SlugResolver {
  static async resolve(siteId: number, slug: string) {
    // 🔥 استدعي العملاق!
    const result = await RedirectGraphEngine.resolve(siteId, slug);

    if (!result) return { type: "not_found" };

    if (result.isOriginal) {
      return { type: "page", data: result.page, canonical: result.page.slug };
    }

    return { type: "redirect", to: result.page.slug };
  }
}
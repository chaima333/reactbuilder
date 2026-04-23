
import { Page } from "../../../models/page";
import PageSlug from "../../../models/pageSlug";

export class RedirectGraphEngine {

  static async resolveFinalPageId(siteId: number, inputSlug: string): Promise<number | null> {

    const visited = new Set<string>();
    let currentSlug = inputSlug;

    while (true) {

      // 🧨 loop protection
      if (visited.has(currentSlug)) {
        throw new Error("REDIRECT_LOOP_DETECTED");
      }

      visited.add(currentSlug);

      // 1. check current page مباشرة
      const page = await Page.findOne({
        where: { siteId, slug: currentSlug }
      });

      if (page) {
        return page.id; // ✅ final truth
      }

      // 2. check history
      const history = await PageSlug.findOne({
        where: { siteId, slug: currentSlug }
      });

      if (!history) {
        return null; // ❌ dead end
      }

      // 3. jump to next slug
      const targetPage = await Page.findByPk(history.pageId);

      if (!targetPage) {
        return null;
      }

      currentSlug = targetPage.slug;
    }
  }
}
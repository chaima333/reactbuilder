import { Page } from "../../../models/page";
import PageSlug from "../../../models/pageSlug";

export class RedirectGraphEngine {

  static async resolveFinalSlug(siteId: number, slug: string) {

    const visited = new Set<string>();
    let currentSlug = slug;

    while (true) {

      if (visited.has(currentSlug)) {
        throw new Error("REDIRECT_LOOP_DETECTED");
      }

      visited.add(currentSlug);

      const record = await PageSlug.findOne({
        where: { siteId, slug: currentSlug }
      });

      if (!record) break;

      const page = await Page.findByPk(record.pageId);

      if (!page) break;

      if (page.slug === currentSlug) {
      return { pageId: page.id, slug: page.slug };
      }

      currentSlug = page.slug;
    }

    return null;
  }
}
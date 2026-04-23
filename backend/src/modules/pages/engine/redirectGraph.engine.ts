
import { Page } from "../../../models/page";
import PageSlug from "../../../models/pageSlug";

export class RedirectGraphEngine {
  static async resolve(siteId: number, inputSlug: string) {
    const visited = new Set<string>();
    let currentSlug = inputSlug;

    while (true) {
      if (visited.has(currentSlug)) throw new Error("REDIRECT_LOOP");
      visited.add(currentSlug);

      const page = await Page.findOne({ where: { siteId, slug: currentSlug, status: 'published' } });
      if (page) return { page, isOriginal: currentSlug === inputSlug };

      const history = await PageSlug.findOne({ where: { siteId, slug: currentSlug } });
      if (!history) return null;

      const targetPage = await Page.findByPk(history.pageId);
      if (!targetPage) return null;

      currentSlug = targetPage.slug; // توّة الـ Loop باش تعاود تلوّج بالـ Slug الجديد
    }
  }
}
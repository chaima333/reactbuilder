
import { Page } from "../../../models/page";
import PageSlug from "../../../models/pageSlug";

export class RedirectGraphEngine {
  static async resolve(siteId: number, inputSlug: string) {
    const visited = new Set<string>();
    let currentSlug = inputSlug;

    while (true) {
      if (visited.has(currentSlug)) throw new Error("REDIRECT_LOOP");
      visited.add(currentSlug);

      // 1. لوّج في الـ Pages (الـ Target الحالي)
      const page = await Page.findOne({ where: { siteId, slug: currentSlug, status: 'published' } });
      if (page) return { page, isOriginal: currentSlug === inputSlug };

      // 2. لوّج في الـ History
      const history = await PageSlug.findOne({ where: { siteId, slug: currentSlug } });
      if (!history) return null;

      // 3. امشي للـ Page اللي مربوطة بالـ History باش تعرف الـ Slug الجديد متاعها
      const targetPage = await Page.findByPk(history.pageId);
      if (!targetPage) return null;

      currentSlug = targetPage.slug; // توّة الـ Loop باش تعاود تلوّج بالـ Slug الجديد
    }
  }
}
import { Page } from "../../../models/page";
import PageSlug from "../../../models/pageSlug";

// redirectGraph.engine.ts
export class RedirectGraphEngine {
  static async resolve(siteId: number, inputSlug: string) {
    const visited = new Set<string>();
    let currentSlug = inputSlug;
    
    while (true) {
      if (visited.has(currentSlug)) throw new Error("LOOP_DETECTED");
      visited.add(currentSlug);

      // 1. لو الـ slug هو الـ "Current" متاع صفحة منشورة، نلقاوها طول
      const page = await Page.findOne({ 
        where: { siteId, slug: currentSlug, status: 'published' },
        attributes: ['id', 'slug'] 
      });

      if (page) return { pageId: page.id, finalSlug: page.slug };

      // 2. لو مالقينهاش، نلوجو في الـ History (page_slugs)
      const history = await PageSlug.findOne({ where: { siteId, slug: currentSlug } });
      if (!history) return null; // لا صفحة لا تاريخ -> 404

      // 3. لو لقينا تاريخ، نشوفو الـ Page الأصلية متاعو وين وصلت
      const targetPage = await Page.findByPk(history.pageId, { attributes: ['id', 'slug', 'status'] });
      
      if (!targetPage || targetPage.status !== 'published') return null;
      
      // لو الـ targetPage عندها slug مختلف، كمل الـ loop (Redirect Chain)
      if (targetPage.slug === currentSlug) return { pageId: targetPage.id, finalSlug: targetPage.slug };
      currentSlug = targetPage.slug;
    }
  }
}
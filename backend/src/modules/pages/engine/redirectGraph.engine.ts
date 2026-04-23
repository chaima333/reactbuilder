import { Page } from "../../../models/page";
import { SlugMap } from "../../../models/slug_map"; // 👈 ثبت من اسم الموديل

export class RedirectGraphEngine {
  static async resolve(siteId: number, inputSlug: string) {
    const visited = new Set<string>();
    let currentSlug = inputSlug;

    while (true) {
      if (visited.has(currentSlug)) throw new Error("REDIRECT_LOOP");
      visited.add(currentSlug);

      // 1. لو الـ Slug هو الصفحة الحالية و Published
      const page = await Page.findOne({ 
        where: { siteId, slug: currentSlug, status: 'published' } 
      });
      
      if (page) {
        return { page, isOriginal: currentSlug === inputSlug };
      }

      // 2. لو موش الصفحة الحالية، نلوجو عليه في جدول الـ SlugMap (تاريخ الروابط)
      const mapping = await SlugMap.findOne({ 
        where: { siteId, slug: currentSlug } 
      });

      if (!mapping) return null;

      // 3. نجيبو الصفحة اللي يشير ليها الـ mapping
      const targetPage = await Page.findByPk(mapping.pageId);
      if (!targetPage || targetPage.status !== 'published') return null;

      // 4. السحر هوني: نمشيو لآخر Slug متاع الصفحة هذي طول
      currentSlug = targetPage.slug;
      
      // الـ Loop باش تعاود تثبت، وهكا نضمنوا إنو الـ Redirect Chain تتقص
    }
  }
}
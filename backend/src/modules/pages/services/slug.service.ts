import { generateSlug } from "../utils/slugify";
import { SlugRepository } from "../repositories/pageSlug.repository";

export class SlugService {
  // يضمن إنو الـ Slug ما يتكررش في نفس الـ Site
  static async generateUniqueSlug(siteId: number, title: string): Promise<string> {
    const baseSlug = generateSlug(title);
    let slug = baseSlug;
    let counter = 1;

    while (await SlugRepository.exists(siteId, slug)) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }
    return slug;
  }

  // يغير الـ Slug ويسجل القديم في الـ History
  static async changeSlug(page: any, newSlug: string, transaction?: any) {
    if (page.slug === newSlug) return newSlug;

    const isTaken = await SlugRepository.exists(page.siteId, newSlug);
    if (isTaken) throw new Error("SLUG_ALREADY_TAKEN");

    // خبي القديم للـ Redirects
    await SlugRepository.saveHistory(page.id, page.siteId, page.slug, transaction);
    
    return newSlug;
  }
}
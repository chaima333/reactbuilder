import { Page } from "../../../models";
import PageSlug from "../../../models/pageSlug";

export class SlugService {

  static async ensureAvailable(siteId: number, slug: string, pageId?: number) {
    const page = await Page.findOne({ where: { siteId, slug } });

    if (page && page.id !== pageId) {
      throw new Error("SLUG_TAKEN");
    }

    const history = await PageSlug.findOne({ where: { siteId, slug } });

    if (history && history.pageId !== pageId) {
      throw new Error("SLUG_RESERVED");
    }
  }

  static async archive(pageId, siteId, slug, transaction?) {

  const existing = await PageSlug.findOne({
    where: { siteId, slug }
  });

  if (existing) return; // 

  return PageSlug.create(
    { pageId, siteId, slug },
    { transaction }
  );
}

  static async isSlugTaken(siteId: number, slug: string) {
    const page = await Page.findOne({ where: { siteId, slug } });
    if (page) return true;

    const history = await PageSlug.findOne({ where: { siteId, slug } });
    return !!history;
  }
}
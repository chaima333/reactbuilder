import { Page } from "../../../models";
import PageSlug from "../../../models/pageSlug";

export class SlugService {

  // 🔥 check if slug can be used
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

  // 🔥 save old slug in history
  static async archive(pageId: number, siteId: number, slug: string, transaction?: any) {
    return PageSlug.create(
      { pageId, siteId, slug },
      { transaction }
    );
  }
}
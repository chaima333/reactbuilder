
 import { Page, PageSlug } from "../../../models";

export class SlugRepository {

  static exists(siteId: number, slug: string) {
    return Page.findOne({ where: { siteId, slug } });
  }

  static findHistory(siteId: number, slug: string) {
    return PageSlug.findOne({ where: { siteId, slug } });
  }

  static saveHistory(pageId: number, siteId: number, slug: string, transaction?: any) {
    return PageSlug.create({ pageId, siteId, slug }, { transaction });
  }
}
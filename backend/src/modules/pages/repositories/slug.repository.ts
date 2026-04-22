/*import { Page, PageSlug } from "../../../models";

export class SlugRepository {
  static async exists(siteId: number, slug: string) {
    return await Page.findOne({ where: { siteId, slug } });
  }

  static async saveHistory(pageId: number, siteId: number, slug: string, transaction?: any) {
    return await PageSlug.create({ pageId, siteId, slug }, { transaction });
  }

  static async findInHistory(siteId: number, slug: string) {
    return await PageSlug.findOne({ where: { siteId, slug } });
  }
}
  */
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
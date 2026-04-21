import { Page, PageSlug } from "../../../models";

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
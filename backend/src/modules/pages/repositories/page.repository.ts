import { Page, PageVersion, PageSlug } from "../../../models";

export class PageRepository {
  // يجيب الصفحة
  static async findById(id: number, siteId: number, transaction?: any) {
    return await Page.findOne({ where: { id, siteId }, transaction });
  }

  // يصوّر نسخة (Snapshot)
  static async createVersion(data: any, transaction?: any) {
    return await PageVersion.create(data, { transaction });
  }

  // يقيّد الـ Slug القديم في الـ History
  static async archiveSlug(pageId: number, siteId: number, slug: string, transaction?: any) {
    return await PageSlug.create({ pageId, siteId, slug }, { transaction });
  }

  // يعمل الـ Update النهائي
  static async updatePage(page: any, data: any, transaction?: any) {
    return await page.update(data, { transaction });
  }
}
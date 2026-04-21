import { Page, PageVersion, PageSlug } from "../../../models";

export class PageRepository {

  static async findById(id: number, siteId: number, transaction?: any) {
    return Page.findOne({ where: { id, siteId }, transaction });
  }

  static async createVersion(data: any, transaction?: any) {
    return PageVersion.create(data, { transaction });
  }

  // ✅ FIX 2: missing method
  static async archiveSlug(
    pageId: number,
    siteId: number,
    slug: string,
    transaction?: any
  ) {
    return PageSlug.create(
      { pageId, siteId, slug },
      { transaction }
    );
  }

  static async updatePage(page: any, data: any, transaction?: any) {
    return page.update(data, { transaction });
  }
}
import { Page, PageVersion, PageSlug } from "../../../models";
import { Op } from "sequelize";

export class PageRepository {

  // ========================
  // FIND BY ID
  // ========================
  static async findById(id: number, siteId: number, transaction?: any) {
    return Page.findOne({
      where: { id, siteId },
      transaction
    });
  }

  // ========================
  // FIND BY TITLE
  // ========================
  static async findByTitle(siteId: number, title: string) {
    return Page.findOne({
      where: {
        siteId,
        title,
        status: { [Op.ne]: "deleted" }
      }
    });
  }

  // ========================
  // FIND ALL PAGES
  // ========================
  static async findAll(siteId: number) {
    return Page.findAll({
      where: {
        siteId,
        status: { [Op.ne]: "deleted" }
      },
      order: [["createdAt", "DESC"]]
    });
  }

  // ========================
  // CREATE PAGE
  // ========================
  static async create(data: any) {
    return Page.create(data);
  }

  // ========================
  // UPDATE PAGE
  // ========================
  static async save(page: any, transaction?: any) {
    return page.save({ transaction });
  }

  static async updatePage(page: any, data: any, transaction?: any) {
    return page.update(data, { transaction });
  }

  // ========================
  // PAGE VERSIONING
  // ========================
 /* static async createVersion(data: any, transaction?: any) {
    return PageVersion.create(data, { transaction });
  }

  static async findVersions(pageId: number, siteId: number) {
    return PageVersion.findAll({
      where: { pageId, siteId },
      order: [["createdAt", "DESC"]],
      limit: 20
    });
  }

  static async findVersionById(versionId: number, pageId: number) {
    return PageVersion.findOne({
      where: { id: versionId, pageId }
    });
  }

  // ========================
  // SLUG HISTORY
  // ========================
  static async archiveSlug(pageId: number, siteId: number, slug: string, transaction?: any) {
    return PageSlug.create(
      { pageId, siteId, slug },
      { transaction }
    );
  }

  static async findSlugHistory(siteId: number, slug: string) {
    return PageSlug.findOne({
      where: { siteId, slug }
    });
  }*/

  // ========================
  // SOFT DELETE SUPPORT (OPTIONAL)
  // ========================
  static async softDelete(page: any, transaction?: any) {
    return page.update(
      { status: "deleted" },
      { transaction }
    );
  }
}

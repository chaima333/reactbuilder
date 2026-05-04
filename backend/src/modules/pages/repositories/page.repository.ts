import { Page, PageVersion, PageSlug } from "../../../models";
import { Op, Transaction } from "sequelize";

export class PageRepository {
  static updatePage(page: Page, arg1: any, t: Transaction) {
    throw new Error("Method not implemented.");
  }

  static findById(id: number, siteId: number) {
    return Page.findOne({ where: { id, siteId } });
  }

  static findByTitle(siteId: number, title: string) {
    return Page.findOne({
      where: { siteId, title, status: { [Op.ne]: "deleted" } }
    });
  }

  static findAll(siteId: number) {
    return Page.findAll({
      where: { siteId, status: { [Op.ne]: "deleted" } },
      order: [["createdAt", "DESC"]]
    });
  }

  static create(data: any) {
    return Page.create(data);
  }

  static save(page: any, transaction?: any) {
    return page.save({ transaction });
  }

  static update(page: any, data: any, transaction?: any) {
    return page.update(data, { transaction });
  }


  static async softDelete(page: any, transaction?: any) {
    return page.update(
      { status: "deleted" },
      { transaction }
    );
  }


/*static async getHistory(pageId: number, siteId: number) {
  return await PageVersion.findAll({
    where: { pageId, siteId },
    order: [["createdAt", "DESC"]], // من الأحدث للأقدم
    limit: 30
  });
}*/
}

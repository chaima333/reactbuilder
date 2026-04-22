import { Page, PageVersion, PageSlug } from "../../../models";
import { Op } from "sequelize";

export class PageRepository {

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
}

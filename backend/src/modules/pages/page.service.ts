import { Op } from "sequelize";
import { Page, ActivityLog } from "../../models";

export class PageService {
  static async createPage(siteId: number, userId: number, data: any) {
    const page = await Page.create({
      ...data,
      siteId,
      userId,
    });

    await ActivityLog.create({
      userId,
      siteId,
      action: "page_created",
      entityType: "page",
      entityId: page.id,
    });

    return page;
  }

  static async getPages(siteId: number) {
    return Page.findAll({
      where: {
        siteId,
        status: { [Op.ne]: "deleted" },
      },
    });
  }

  static async updatePage(siteId: number, pageId: number, userId: number, data: any) {
    const page = await Page.findOne({
      where: {
        id: pageId,
        siteId,
      },
    });

    if (!page) throw new Error("PAGE_NOT_FOUND");

    await page.update(data);

    return page;
  }
}
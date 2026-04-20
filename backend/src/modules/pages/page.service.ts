import { Op } from "sequelize";
import { Page, ActivityLog } from "../../models";
import slugify from "slugify";

export class PageService {
  static async createPage(siteId: number, userId: number, data: any) {
    const slug = await this.generateUniqueSlug(siteId, data.title);
    
    const page = await Page.create({
      ...data,
      slug, 
      siteId,
      userId,
      status: data.status || "draft",
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

  static async updatePage(siteId: number, pageId: number, userId: number, data: any) {
    const page = await Page.findOne({ where: { id: pageId, siteId } });
    if (!page) throw new Error("PAGE_NOT_FOUND");

    if (data.title && data.title !== page.title) {
      data.slug = await this.generateUniqueSlug(siteId, data.title, pageId);
    }

    await page.update({
        ...data,
        userId 
    });
    
    return page;
  }

  private static async generateUniqueSlug(siteId: number, title: string, excludeId?: number): Promise<string> {
    const baseSlug = slugify(title, { lower: true, strict: true });
    let slug = baseSlug;
    let counter = 1;

    while (true) {
      const existing = await Page.findOne({
        where: { 
          slug, 
          siteId,
          ...(excludeId && { id: { [Op.ne]: excludeId } }) 
        }
      });

      if (!existing) break;
      slug = `${baseSlug}-${counter}`;
      counter++;
    }
    return slug;
  }

  static async getPages(siteId: number) {
    return Page.findAll({
      where: {
        siteId,
        status: { [Op.ne]: "deleted" },
      },
      order: [['createdAt', 'DESC']] 
    });
  }
}
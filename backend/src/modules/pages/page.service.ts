import { Op } from "sequelize";
import { Page, ActivityLog } from "../../models";
import { PageCreateInput, PageUpdateInput } from "./page.types";

export class PageService {
  // Helper: Slug Logic (نفس اللي عندك أما منظم)
  private static async generateSlug(title: string, siteId: number, excludeId?: number): Promise<string> {
    let baseSlug = title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    let slug = baseSlug;
    let counter = 1;

    while (await Page.findOne({
      where: {
        slug,
        siteId: siteId,
        status: { [Op.ne]: "deleted" },
        ...(excludeId ? { id: { [Op.ne]: excludeId } } : {}),
      },
    })) {
      slug = `${baseSlug}-${counter++}`;
    }
    return slug;
  }

  // 🔥 Create مع Slug و Log
  static async createPage(siteId: number, userId: number, data: PageCreateInput) {
    const slug = await this.generateSlug(data.title, siteId);
    
    const page = await Page.create({
      ...data,
      slug,
      siteId,
      userId,
    });

    await ActivityLog.create({ 
      userId, siteId, action: "page_created", entityType: "page", entityId: page.id, details: { title: page.title } 
    }).catch(e => console.warn("Log failed", e));

    return page;
  }

  // 🔥 Update مع Slug Logic
  static async updatePage(siteId: number, pageId: number, userId: number, data: PageUpdateInput) {
    const page = await Page.findOne({ where: { id: pageId, site_id: siteId } });
    if (!page || page.status === "deleted") throw new Error("PAGE_NOT_FOUND");

    const updateData: any = { ...data };
    if (data.title && data.title !== page.title) {
      updateData.slug = await this.generateSlug(data.title, siteId, pageId);
    }

    await page.update(updateData);

    await ActivityLog.create({ 
      userId, siteId, action: "page_updated", entityType: "page", entityId: page.id, details: { title: page.title } 
    }).catch(e => console.warn("Log failed", e));

    return page;
  }

  static async getPages(siteId: number) {
    return await Page.findAll({
      where: { siteId, status: { [Op.ne]: "deleted" } },
      order: [["createdAt", "ASC"]],
    });
  }
}
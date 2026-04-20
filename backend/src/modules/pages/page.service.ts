import { Op } from "sequelize";
import { Page, ActivityLog } from "../../models";
import slugify from "slugify";

const { nanoid } = require('nanoid');


export class PageService {
  // ✅ توليد Slug فريد (Deterministic + Random Suffix) - مفيش Loops!
  private static generateBulletproofSlug(title: string): string {
    const base = slugify(title, { lower: true, strict: true });
    return `${base}-${nanoid(5)}`; 
  }

  static async createPage(siteId: number, userId: number, data: any) {
    const slug = this.generateBulletproofSlug(data.title);

    const page = await Page.create({
      title: data.title,
      content: data.content || "",
      blocks: data.blocks || [],
      status: "draft",
      slug: slug,
      siteId, // مفروض فرضاً من الـ Context
      userId,
    });

    await ActivityLog.create({
      userId, siteId,
      action: "page_created",
      entityType: "page",
      entityId: page.id,
    });

    return page;
  }

  static async updatePage(siteId: number, pageId: number, userId: number, data: any) {
    const page = await Page.findOne({ where: { id: pageId, siteId } });
    if (!page) throw new Error("PAGE_NOT_FOUND");

    // 🛡️ Whitelist Enforcement: نختارو فقط الحقول المسموح بتعديلها
    const { title, content, blocks, status } = data;
    
    // الـ Slug يبقى ثابت (Immutable) لحماية الـ SEO
    await page.update({
      title,
      content,
      blocks,
      status,
      userId // لتتبع من قام بآخر تعديل
    });

    return page;
  }

  static async getPages(siteId: number) {
    return Page.findAll({
      where: { siteId, status: { [Op.ne]: "deleted" } },
      order: [["createdAt", "DESC"]],
    });
  }
}
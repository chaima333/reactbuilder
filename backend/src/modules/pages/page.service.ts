import { Op } from "sequelize";
import { Page, ActivityLog } from "../../models"; 
import slugify from "slugify";
import { canTransition, canPublish, PAGE_STATUS } from "./rules";
import { PageVersion } from "../../models/pageVersion";

// @ts-ignore
const { nanoid } = require('nanoid');

export class PageService {
  
  private static generateBulletproofSlug(title: string): string {
    const base = slugify(title, { lower: true, strict: true });
    return `${base}-${nanoid(5)}`; 
  }

  // ✅ الدالة اللي كانت ناقصة في الـ Service
  static async updatePage(siteId: number, pageId: number, userId: number, data: any) {
    const page = await Page.findOne({ where: { id: pageId, siteId } });
    if (!page) throw new Error("PAGE_NOT_FOUND");

    await page.update({
      title: data.title,
      content: data.content,
      blocks: data.blocks,
      status: data.status, // هنا نثبتو في الـ status العادي (draft/review)
      userId: userId 
    });

    return page;
  }

  static async publishPage(siteId: number, pageId: number, userRole: string, userId: number) {
    const page = await Page.findOne({ where: { id: pageId, siteId } });
    if (!page) throw new Error("PAGE_NOT_FOUND");

    if (!canPublish(userRole)) throw new Error("FORBIDDEN");
    if (!canTransition(page.status, PAGE_STATUS.PUBLISHED)) throw new Error("INVALID_TRANSITION");

    // 📸 Versioning Snapshot
    await PageVersion.create({
      pageId: page.id,
      title: page.title,
      content: page.content,
      blocks: page.blocks,
      versionTag: `v-${new Date().getTime()}`,
      createdBy: userId
    });

    return await page.update({
      status: PAGE_STATUS.PUBLISHED,
      publishedAt: new Date(),
    });
  }

  static async createPage(siteId: number, userId: number, data: any) {
    const existingPage = await Page.findOne({
      where: { siteId, title: data.title, status: { [Op.ne]: "deleted" } },
    });

    if (existingPage) {
      return await this.updatePage(siteId, existingPage.id, userId, data);
    }

    const slug = this.generateBulletproofSlug(data.title);
    return await Page.create({
      ...data,
      slug,
      status: PAGE_STATUS.DRAFT,
      siteId,
      userId,
    });
  }

  static async getPages(siteId: number) {
    return Page.findAll({
      where: { siteId, status: { [Op.ne]: "deleted" } },
      order: [["createdAt", "DESC"]],
    });
  }
}
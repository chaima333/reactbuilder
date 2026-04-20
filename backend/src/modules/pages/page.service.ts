import { Op } from "sequelize";
import { Page, ActivityLog } from "../../models";
import slugify from "slugify";

// @ts-ignore
const { nanoid } = require('nanoid');

export class PageService {
  static getById(pageId: number) {
    throw new Error("Method not implemented.");
  }
 static async updatePageStatus(pageId: number, status: string) {
  return Page.update(
    { status },
    { where: { id: pageId } }
  );
}
  // ✅ توليد Slug فريد
  private static generateBulletproofSlug(title: string): string {
    const base = slugify(title, { lower: true, strict: true });
    return `${base}-${nanoid(5)}`; 
  }

  static async createPage(siteId: number, userId: number, data: any) {
    // 🔍 1. التثبت: هل فمة صفحة بنفس العنوان في نفس الـ Site؟
    const existingPage = await Page.findOne({
      where: {
        siteId,
        title: data.title,
        status: { [Op.ne]: "deleted" } // نلوجوا كان في اللي مش مفسخين
      },
    });

    // 🚀 2. الـ Upsert Logic: إذا موجودة، حدثها ورجعها
    if (existingPage) {
      await existingPage.update({
        content: data.content || existingPage.content,
        blocks: data.blocks || existingPage.blocks,
        userId: userId // شكون آخر واحد مسّها
      });
      
      // نسجلوا تعديل موش إنشاء جديد
      await ActivityLog.create({
        userId, siteId,
        action: "page_updated_via_upsert",
        entityType: "page",
        entityId: existingPage.id,
      });

      return existingPage;
    }

    // ✨ 3. إذا مش موجودة، اصنع وحدة جديدة
    const slug = this.generateBulletproofSlug(data.title);

    const page = await Page.create({
      title: data.title,
      content: data.content || "",
      blocks: data.blocks || [],
      status: "draft",
      slug: slug,
      siteId,
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

    const { title, content, blocks, status } = data;
    
    await page.update({
      title,
      content,
      blocks,
      status,
      userId 
    });

    return page;
  }

  static async getPages(siteId: number) {
    return Page.findAll({
      where: { siteId, status: { [Op.ne]: "deleted" } },
      order: [["createdAt", "DESC"]],
    });
  }

  static async publishPage(siteId: number, pageId: number) {
    const page = await Page.findOne({ where: { id: pageId, siteId } });
    if (!page) throw new Error("PAGE_NOT_FOUND");

    // تحويل الـ status لـ published
    return await page.update({ status: "published" });
}
}
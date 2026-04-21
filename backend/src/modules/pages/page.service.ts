import { Op } from "sequelize";
import { Page, ActivityLog } from "../../models"; 
import slugify from "slugify";
import { canTransition, canPublish, PAGE_STATUS } from "./rules";
import { PageVersion } from "../../models/pageVersion";
import PageSlug from "../../models/pageSlug";
import { sequelize } from "../../core/database/connection";

// @ts-ignore
const { nanoid } = require('nanoid');

export class PageService {
  
  private static generateBulletproofSlug(title: string): string {
    const base = slugify(title, { lower: true, strict: true });
    return `${base}-${nanoid(5)}`; 
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


 static async updatePage(siteId: number, pageId: number, userId: number, data: any) {
    const transaction = await sequelize.transaction();
    try {
        const page = await Page.findOne({ where: { id: pageId, siteId }, transaction });
        
        if (data.slug && data.slug !== page.slug) {
            // سجل الـ History داخل نفس الـ Transaction
            await PageSlug.create({
                pageId: page.id,
                slug: page.slug,
                siteId
            }, { transaction });
        }

        await page.update(data, { transaction });
        
        await transaction.commit();
        return page;
    } catch (error) {
        await transaction.rollback();
        throw error;
    }
}
  //HISTORY DU PAGES SUPPRIME //
static async getPageHistory(pageId: number, siteId: number) {
  return await PageVersion.findAll({
    where: { pageId },
    order: [["createdAt", "DESC"]], // النسخة الأحدث تظهر الأولى
    limit: 10 // نرجعو آخر 10 نسخ بركة باش ما نثقلوش الـ API
  });
}

static async restoreVersion(siteId: number, pageId: number, versionId: number) {
  // نثبتو إنو النسخة تابعة لـ نفس الصفحة
  const version = await PageVersion.findOne({ where: { id: versionId, pageId } });
  const page = await Page.findOne({ where: { id: pageId, siteId } });

  if (!version || !page) throw new Error("VERSION_OR_PAGE_NOT_FOUND");

  return await page.update({
    title: version.title,
    content: version.content,
    blocks: version.blocks,
    status: 'draft' // نرجعوها draft باش الـ user يثبت فيها قبل ما ينشرها مرة أخرى
  });
}

// PageService.ts

static async isSlugTaken(siteId: number, slug: string): Promise<boolean> {
    // نثبتو في الصفحات الحالية
    const page = await Page.findOne({ where: { slug, siteId } });
    if (page) return true;

    // نثبتو في التاريخ (History)
    const history = await PageSlug.findOne({ where: { slug, siteId } });
    return !!history;
}


}


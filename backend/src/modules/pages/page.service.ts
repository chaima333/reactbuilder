import { Op } from "sequelize";
import { Page, ActivityLog } from "../../models"; 
import slugify from "slugify";
import { canTransition, canPublish, PAGE_STATUS } from "./rules";
import { PageVersion } from "../../models/pageVersion";
import PageSlug from "../../models/pageSlug";
import { sequelize } from "../../core/database/connection";

import { PageRepository } from "./repositories/page.repository";
import { PageEngine } from "./engine/page.engine";

// @ts-ignore
const { nanoid } = require('nanoid');

export class PageService {
  
  // 🛠️ Private Utilities
  private static generateBulletproofSlug(title: string): string {
    const base = slugify(title, { lower: true, strict: true });
    return `${base}-${nanoid(5)}`; 
  }

  // 🚀 Core Engine: UPDATE
  static async updatePage(siteId: number, pageId: number, userId: number, data: any) {
    const transaction = await sequelize.transaction();
    try {
      const page = await PageRepository.findById(pageId, siteId, transaction);
      if (!page) throw new Error("PAGE_NOT_FOUND");

      // 1. Snapshot: لو التبديل مهم، صوّر نسخة قبل ما تبدّل
      if (PageEngine.needsVersion(page, data)) {
        await PageRepository.createVersion({
          pageId: page.id,
          siteId,
          title: page.title,
          content: page.content,
          blocks: page.blocks,
          createdBy: userId
        }, transaction);
      }

      // 2. Slug History: لو الـ slug تبدل، أرشف القديم
      if (PageEngine.isSlugChanged(page.slug, data.slug)) {
        await PageRepository.archiveSlug(page.id, siteId, page.slug, transaction);
      }

      // 3. Actual Update: بدّل الداتا ورجعها Draft
      const updatedPage = await PageRepository.updatePage(page, {
        ...data,
        status: PAGE_STATUS.DRAFT
      }, transaction);

      await transaction.commit();
      return updatedPage;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  // 🚀 Core Engine: PUBLISH
  static async publishPage(siteId: number, pageId: number, userRole: string, userId: number) {
    const page = await Page.findOne({ where: { id: pageId, siteId } });
    if (!page) throw new Error("PAGE_NOT_FOUND");

    if (!canPublish(userRole)) throw new Error("FORBIDDEN");
    if (!canTransition(page.status, PAGE_STATUS.PUBLISHED)) throw new Error("INVALID_TRANSITION");

    // 📸 Versioning Snapshot before publish
    await PageVersion.create({
      pageId: page.id,
      title: page.title,
      content: page.content,
      blocks: page.blocks,
      versionTag: `v-pub-${new Date().getTime()}`,
      createdBy: userId
    });

    return await page.update({
      status: PAGE_STATUS.PUBLISHED,
      publishedAt: new Date(),
    });
  }

  // 🚀 Core Engine: CREATE
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

  // 🚀 GETTERS
  static async getPages(siteId: number) {
    return Page.findAll({
      where: { siteId, status: { [Op.ne]: "deleted" } },
      order: [["createdAt", "DESC"]],
    });
  }

  static async getPageHistory(pageId: number, siteId: number) {
    return await PageVersion.findAll({
      where: { pageId },
      order: [["createdAt", "DESC"]],
      limit: 10 
    });
  }

  // 🚀 RESTORE
  static async restoreVersion(siteId: number, pageId: number, versionId: number) {
    const version = await PageVersion.findOne({ where: { id: versionId, pageId } });
    const page = await Page.findOne({ where: { id: pageId, siteId } });

    if (!version || !page) throw new Error("VERSION_OR_PAGE_NOT_FOUND");

    return await page.update({
      title: version.title,
      content: version.content,
      blocks: version.blocks,
      status: PAGE_STATUS.DRAFT
    });
  }

  static async isSlugTaken(siteId: number, slug: string): Promise<boolean> {
    const page = await Page.findOne({ where: { slug, siteId } });
    if (page) return true;

    const history = await PageSlug.findOne({ where: { slug, siteId } });
    return !!history;
  }
}
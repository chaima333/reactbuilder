import { Op } from "sequelize";
import { Page } from "../../../models";
import slugify from "slugify";
import { sequelize } from "../../../core/database/connection";

import { PageRepository } from "../repositories/page.repository";
import { PageEngine } from "../engine/page.engine";
import { SlugService } from "../services/slug.service";
import { canPublish, canTransition, PAGE_STATUS } from "../rules/rules";

const { nanoid } = require("nanoid");

export class PageService {

  private static generateSlug(title: string): string {
    const base = slugify(title, { lower: true, strict: true });
    return `${base}-${nanoid(5)}`;
  }

  // ================= CREATE =================
  static async createPage(siteId: number, userId: number, data: any) {

    const existing = await Page.findOne({
      where: { siteId, title: data.title, status: { [Op.ne]: "deleted" } }
    });

    if (existing) {
      return this.updatePage(siteId, existing.id, userId, data);
    }

    const slug = this.generateSlug(data.title);

    return Page.create({
      ...data,
      slug,
      siteId,
      userId,
      status: PAGE_STATUS.DRAFT
    });
  }

  // ================= UPDATE =================
  static async updatePage(siteId: number, pageId: number, userId: number, data: any) {

    const transaction = await sequelize.transaction();

    try {
      const page = await PageRepository.findById(pageId, siteId, transaction);
      if (!page) throw new Error("PAGE_NOT_FOUND");

      if (data.slug && data.slug !== page.slug) {
        await SlugService.ensureAvailable(siteId, data.slug, pageId);
      }

      if (PageEngine.isSlugChanged(page.slug, data.slug)) {
        await SlugService.archive(page.id, siteId, page.slug, transaction);
      }

      const updated = await PageRepository.updatePage(
        page,
        { ...data, status: PAGE_STATUS.DRAFT },
        transaction
      );

      await transaction.commit();
      return updated;

    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  }

  // ================= PUBLISH =================
  static async publishPage(siteId: number, pageId: number, userRole: string, userId: number) {

    const page = await Page.findOne({ where: { id: pageId, siteId } });
    if (!page) throw new Error("PAGE_NOT_FOUND");

    if (!canPublish(userRole)) throw new Error("FORBIDDEN");
    if (!canTransition(page.status, PAGE_STATUS.PUBLISHED)) {
      throw new Error("INVALID_TRANSITION");
    }

    return page.update({
      status: PAGE_STATUS.PUBLISHED,
      publishedAt: new Date()
    });
  }

  // ================= GET =================
  static async getPages(siteId: number) {
    return Page.findAll({
      where: { siteId, status: { [Op.ne]: "deleted" } },
      order: [["createdAt", "DESC"]]
    });
  }
   static async deletePage(siteId: number, pageId: number) {
  const page = await Page.findOne({
    where: { id: pageId, siteId }
  });

  if (!page) throw new Error("PAGE_NOT_FOUND");

  await page.update({
    status: PAGE_STATUS.DELETED
  });

  return true;
}
}
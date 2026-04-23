
import slugify from "slugify";
import { PageRepository } from "../repositories/page.repository";
import { canPublish, canTransition, PAGE_STATUS } from "../domain/rules";
import { PageVersionRepository } from "../repositories/pageVersion.repository";
import { sequelize } from "../../../core/database/connection";
import { PageEngine } from "../engine/page.engine";
import { PageSlug } from "../../../models/pageSlug";
import { Page } from "../../../models/page";
import { SlugMap } from "../../../models/slug_map";


const { nanoid } = require("nanoid");

export class PageService {

  private static generateSlug(title: string) {
    const base = slugify(title, { lower: true, strict: true });
    return `${base}-${nanoid(5)}`;
  }

  // ================= CREATE =================
  static async createPage(siteId: number, userId: number, data: any) {

    const existing = await PageRepository.findByTitle(siteId, data.title);

    if (existing) {
      throw new Error("PAGE_ALREADY_EXISTS");
    }

    return PageRepository.create({
      ...data,
      slug: this.generateSlug(data.title),
      siteId,
      userId,
      status: PAGE_STATUS.DRAFT
    });
  }

  // ================= GET =================
  static async getPages(siteId: number) {
    return PageRepository.findAll(siteId);
  }

  // ================= UPDATE =================

  static async updatePage(siteId, pageId, userId, data) {

    return sequelize.transaction(async (t) => {

      const page = await Page.findByPk(pageId);
      if (!page) throw new Error("NOT_FOUND");

      const oldSlug = page.slug;
      const newSlug = data.slug;

      // 1. update page
      const updated = await page.update(data, { transaction: t });

      // 2. if slug changed → update index
      if (oldSlug !== newSlug) {

        await SlugMap.bulkCreate([
          {
            siteId,
            slug: newSlug,
            pageId,
            type: "page"
          },
          {
            siteId,
            slug: oldSlug,
            pageId,
            type: "redirect"
          }
        ], { transaction: t });
      }

      return updated;
    });
  }


  // ================= DELETE =================
  static async deletePage(siteId: number, pageId: number) {

    const page = await PageRepository.findById(pageId, siteId);
    if (!page) throw new Error("PAGE_NOT_FOUND");

    page.status = PAGE_STATUS.DELETED;

    return PageRepository.save(page);
  }
 
  
   // ================= PUBLISH =================
static async publishPage(siteId, pageId, userRole, userId) {

    const transaction = await sequelize.transaction();

    try {

      const page = await PageRepository.findById(pageId, siteId);
      if (!page) throw new Error("PAGE_NOT_FOUND");

      if (!canPublish(userRole)) {
        throw new Error("FORBIDDEN");
      }

      if (!canTransition(page.status, PAGE_STATUS.PUBLISHED)) {
        throw new Error("INVALID_TRANSITION");
      }

      // 1. snapshot version
      await PageVersionRepository.create({
        pageId: page.id,
        siteId,
        title: page.title,
        content: page.content,
        blocks: page.blocks,
        status: page.status,
        createdBy: userId
      }, transaction);

      // 2. update page cleanly
      const updated = await PageRepository.update(
        page,
        {
          status: PAGE_STATUS.PUBLISHED,
          publishedAt: new Date()
        },
        transaction
      );

      await transaction.commit();

      return updated;

    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  }
}

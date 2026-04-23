
import slugify from "slugify";
import { PageRepository } from "../repositories/page.repository";
import { SlugService } from "../services/slug.service";
import { canPublish, canTransition, PAGE_STATUS } from "../domain/rules";
import { PageVersionRepository } from "../repositories/pageVersion.repository";
import { sequelize } from "../../../core/database/connection";
import { PageEngine } from "../engine/page.engine";


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
static async updatePage(siteId: number, pageId: number, userId: number, data: any) {
  const transaction = await sequelize.transaction();
  try {
    const page = await PageRepository.findById(pageId, siteId);
    if (!page) throw new Error("PAGE_NOT_FOUND");

    // 🔥 نعيطو للـ Engine ياخذ القرارات
    const actions = PageEngine.resolveActions(page, data);

    // 1. أرشفة الـ Slug لو الـ Engine قال "SLUG"
    if (actions.includes("SLUG")) {
      await SlugService.ensureAvailable(siteId, data.slug, pageId);
      await SlugService.archive(page.id, siteId, page.slug, transaction);
    }

    // 2. تحديث الصفحة (ونردّوها Draft كيف ما حبيت إنت)
    const updated = await PageRepository.update(
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

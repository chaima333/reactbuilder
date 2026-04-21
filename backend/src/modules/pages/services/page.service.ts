import { sequelize } from "../../../core/database/connection";
import { PageRepository } from "../repositories/page.repository";
import { PageEngine } from "../engine/page.engine";
import { SlugService } from "./slug.service";

export class PageService {

  static async updatePage(siteId: number, pageId: number, userId: number, data: any) {

    const transaction = await sequelize.transaction();

    try {

      const page = await PageRepository.findById(pageId, siteId, transaction);
      if (!page) throw new Error("PAGE_NOT_FOUND");

      // 🔥 slug validation (INSIDE transaction)
      if (data.slug) {
        await SlugService.ensureAvailable(siteId, data.slug, pageId);
      }

      // 🔥 versioning
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

      // 🔥 slug history
      if (PageEngine.isSlugChanged(page.slug, data.slug)) {
        await SlugService.archive(page.id, siteId, page.slug, transaction);
      }

      const updated = await PageRepository.updatePage(page, {
        ...data,
        status: "draft"
      }, transaction);

      await transaction.commit();
      return updated;

    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  }
}
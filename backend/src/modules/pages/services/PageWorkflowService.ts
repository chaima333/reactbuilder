import { PageRepository } from "../repositories/page.repository";
import { PageVersionRepository } from "../repositories/pageVersion.repository";
import { SlugRepository } from "../repositories/slug.repository";
import { PagePolicy } from "../domain/page.policy";
import { PAGE_STATUS } from "../domain/rules";
import { sequelize } from "../../../core/database/connection";

export class PageWorkflowService {

  static async publish(siteId: number, pageId: number, role: string, userId: number) {

    const t = await sequelize.transaction();

    try {

      const page = await PageRepository.findById(pageId, siteId);
      if (!page) throw new Error("PAGE_NOT_FOUND");

      // 1. policy check
      if (!PagePolicy.canPublish(role, page.status)) {
        throw new Error("FORBIDDEN");
      }

      if (!PagePolicy.canTransition(page.status, PAGE_STATUS.PUBLISHED)) {
        throw new Error("INVALID_TRANSITION");
      }

      // 2. archive slug (important for SEO)
      await SlugRepository.saveHistory(page.id, siteId, page.slug, t);

      // 3. version snapshot
      await PageVersionRepository.create({
        pageId: page.id,
        siteId,
        title: page.title,
        content: page.content,
        blocks: page.blocks,
        status: page.status,
        createdBy: userId
      }, t);

      // 4. update page
      page.status = PAGE_STATUS.PUBLISHED;
      page.publishedAt = new Date();

      const updated = await PageRepository.save(page, t);

      await t.commit();
      return updated;

    } catch (e) {
      await t.rollback();
      throw e;
    }
  }


  static async restoreVersion(
    siteId: number,
    pageId: number,
    versionId: number
  ) {

    const t = await sequelize.transaction();

    try {

      // 1. get page
      const page = await PageRepository.findById(pageId, siteId);
      if (!page) throw new Error("PAGE_NOT_FOUND");

      // 2. get version
      const version = await PageVersionRepository.findById(versionId, pageId);
      if (!version) throw new Error("VERSION_NOT_FOUND");

      // 3. snapshot current state before overwrite
      await PageVersionRepository.create({
        pageId: page.id,
        siteId,
        title: page.title,
        content: page.content,
        blocks: page.blocks,
        status: page.status,
        createdBy: version.createdBy
      }, t);

      // 4. restore old version
      page.title = version.title;
      page.content = version.content;
      page.blocks = version.blocks;
      page.status = PAGE_STATUS.DRAFT;

      const updated = await PageRepository.save(page, t);

      await t.commit();
      return updated;

    } catch (err) {
      await t.rollback();
      throw err;
    }
  }
}
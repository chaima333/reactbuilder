import slugify from "slugify";
import { PageRepository } from "../repositories/page.repository";
import { canPublish, canTransition, PAGE_STATUS } from "../domain/rules";
import { PageVersionRepository } from "../repositories/pageVersion.repository";
import { sequelize } from "../../../core/database/connection";
import { Page } from "../../../models/page";
import { SlugMap } from "../../../models/slug_map";
import { PageEngine } from "../engine/page.engine";
import { PAGE_EVENTS } from "../../../core/plugins/events/pageEvents";

const { nanoid } = require("nanoid");

export class PageService {

  private static generateSlug(title: string) {
    const base = slugify(title, { lower: true, strict: true });
    return `${base}-${nanoid(5)}`;
  }

  // ================= CREATE =================
  static async createPage(siteId: number, userId: number, data: any) {
    const existing = await PageRepository.findByTitle(siteId, data.title);
    if (existing) throw new Error("PAGE_ALREADY_EXISTS");

    const slug = this.generateSlug(data.title);

    const page = await PageRepository.create({
      ...data,
      slug,
      siteId,
      userId,
      status: PAGE_STATUS.DRAFT
    });

    await SlugMap.create({
      siteId,
      slug,
      pageId: page.id,
      type: "page",
      isActive: true
    });

    return {
      data: page,
      event: {
        type: PAGE_EVENTS.CREATED,
        payload: { page: page.toJSON(), siteId, userId },
        shouldEmit: true
      }
    };
  }

  // ================= GET =================
  static async getPages(siteId: number) {
    return PageRepository.findAll(siteId);
  }

  // ================= UPDATE =================

static async updatePage(siteId: number, pageId: number, userId: number, input: any) {
    return await sequelize.transaction(async (t) => {
      const page = await Page.findOne({ where: { id: pageId, siteId }, transaction: t });
      if (!page) throw new Error("PAGE_NOT_FOUND");

      const oldPage = page.toJSON();
      const actions = PageEngine.resolveActions(oldPage, input);
      const updated = await page.update(input, { transaction: t });

      // ✅ نرجعوا الـ Data والـ Event المعرّف بوضوح
      return {
        data: updated,
        event: {
          type: PAGE_EVENTS.UPDATED,
          payload: { 
            page: updated.toJSON(), 
            oldPage, 
            userId, 
            siteId, 
            meta: { shouldVersion: actions.shouldVersion } 
          }
        }
      };
    });
  }

  // ================= DELETE =================
  static async deletePage(siteId: number, pageId: number) {
    const page = await PageRepository.findById(pageId, siteId);
    if (!page) throw new Error("PAGE_NOT_FOUND");

    const updated = await page.update({ status: PAGE_STATUS.DELETED });

    return {
      data: updated,
      event: {
        type: PAGE_EVENTS.DELETED,
        payload: { pageId, siteId },
        shouldEmit: true
      }
    };
  }

  // ================= PUBLISH =================
  static async publishPage(siteId: number, pageId: number, userRole: string, userId: number) {
    return await sequelize.transaction(async (t) => {
      const page = await PageRepository.findById(pageId, siteId);
      if (!page) throw new Error("PAGE_NOT_FOUND");

      if (!canPublish(userRole)) throw new Error("FORBIDDEN");
      if (!canTransition(page.status, PAGE_STATUS.PUBLISHED)) throw new Error("INVALID_TRANSITION");

      const oldPageSnapshot = page.toJSON();

      await PageVersionRepository.create({
        pageId: page.id,
        siteId,
        title: page.title,
        content: page.content,
        blocks: page.blocks,
        status: page.status,
        createdBy: userId
      }, { transaction: t });

      const updated = await page.update({
        status: PAGE_STATUS.PUBLISHED,
        publishedAt: new Date()
      }, { transaction: t });

      return {
        data: updated,
        event: {
          type: PAGE_EVENTS.PUBLISHED,
          payload: { page: updated.toJSON(), oldPage: oldPageSnapshot, siteId, userId },
          shouldEmit: true
        }
      };
    });
  }

  // ================= RESTORE =================
  static async restoreVersion(siteId: number, pageId: number, versionId: number, userId: number) {
    return await sequelize.transaction(async (t) => {
      const version = await PageVersionRepository.findById(versionId, siteId);
      if (!version) throw new Error("VERSION_NOT_FOUND");

      const page = await Page.findOne({ where: { id: pageId, siteId }, transaction: t });
      if (!page) throw new Error("PAGE_NOT_FOUND");

      const oldPageSnapshot = page.toJSON();
      const restored = await page.update({
        title: version.title,
        content: version.content,
        blocks: version.blocks,
        status: PAGE_STATUS.DRAFT
      }, { transaction: t });

      return {
        data: restored,
        event: {
          type: PAGE_EVENTS.RESTORED,
          payload: { current: restored.toJSON(), oldPage: oldPageSnapshot, siteId, userId }
        }
      };
    });
  }
}
import slugify from "slugify";
import { PageRepository } from "../repositories/page.repository";
import { canPublish, canTransition, PAGE_STATUS } from "../domain/rules";
import { PageVersionRepository } from "../repositories/pageVersion.repository";
import { sequelize } from "../../../core/database/connection";
import { Page } from "../../../models/page";
import { SlugMap } from "../../../models/slug_map";
import { PAGE_EVENTS } from "../../../core/plugins/events/pageEvents";
import crypto from 'crypto';
import PageVersion from "../../../models/pageVersion";
import { updatePageHandler } from "../commands/updatePage.handler";

const { nanoid } = require("nanoid");

export class PageService {

 private static generateSlug(title: string) {
    return `${slugify(title, { lower: true, strict: true })}-${nanoid(5)}`;
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
  return await updatePageHandler({
    payload: { pageId, ...input },
    context: { 
      userId, 
      siteId, 
      source: "page.handler", // ✅ أضف هذا السطر لكي يعرف الـ Plugin أن المصدر موثوق
      action: "update" 
    }
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
    return sequelize.transaction(async (t) => {

      const page = await Page.findOne({
        where: { id: pageId, siteId },
        transaction: t
      });

      if (!page) throw new Error("PAGE_NOT_FOUND");

      if (!canPublish(userRole)) throw new Error("FORBIDDEN");

      if (!canTransition(page.status, PAGE_STATUS.PUBLISHED)) {
        return {
          data: page,
          event: {
            type: PAGE_EVENTS.PUBLISHED,
            shouldEmit: false,
            payload: { page: page.toJSON(), alreadyPublished: true }
          }
        };
      }

      const oldSnapshot = page.toJSON();

      await PageVersion.create({
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
          shouldEmit: true,
          payload: {
            page: updated.toJSON(),
            oldPage: oldSnapshot,
            siteId,
            userId
          }
        }
      };
    });
  }


  // ================= RESTORE =================
static async restoreVersion(siteId: number, pageId: number, versionId: number, userId: number) {
  return await sequelize.transaction(async (t) => {
    // 1. جلب البيانات
    const version = await PageVersion.findOne({ where: { id: versionId, pageId }, transaction: t });
    if (!version) throw new Error("VERSION_NOT_FOUND");

    const page = await Page.findByPk(pageId, { transaction: t });
    const oldPage = page.toJSON();

    // 2. عملية الـ Restore الفعلية
    await page.update({ 
      content: version.content, 
      title: version.title,
      blocks: version.blocks 
    }, { transaction: t });

    const updatedPage = page.toJSON();

    // 3. الميثاق الجديد (The New Event Contract) 🛡️
    return {
      data: page,
      event: {
        type: "page.restored",
        shouldEmit: true,
        payload: {
          context: {
            eventId: crypto.randomUUID(), // الطابع البريدي الرسمي
            timestamp: Date.now(),
            action: "restore",
            userId: userId,
            siteId: siteId
          },
          source:"restore",
          current: updatedPage,  // الصفحة بعد ما رجعت (كانت اسمها newPage)
          previous: oldPage,    // الصفحة قبل ما تتبدل (كانت اسمها oldPage)
          changes: ["title", "content", "blocks"], // في الـ restore نعتبروا كل شيء تبدل
          versionId: versionId // معلومة إضافية تنفعنا
        }
      }
    };
  });
}
}
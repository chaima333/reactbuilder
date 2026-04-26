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
import { detectChanges } from "../../../core/plugins/events/eventBus";

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
  return sequelize.transaction(async (t) => {

    const page = await Page.findOne({
      where: { id: pageId, siteId },
      transaction: t
    });

    if (!page) throw new Error("PAGE_NOT_FOUND");

    // 1️⃣ Snapshot قبل التعديل
    const oldPage = page.get({ plain: true });

    // 2️⃣ التحديث في الـ Database
    const updatedPage = await page.update(input, { transaction: t });

    // 3️⃣ Snapshot بعد التعديل
    const newPage = updatedPage.get({ plain: true });

    // 4️⃣ حساب التغييرات الحقيقية
// في PageService.updatePage
const changes = detectChanges(oldPage, newPage);

console.log("-----------------------------------------");
console.log("🕵️ DIFF ANALYZER:");
console.log("OLD TITLE:", oldPage.title);
console.log("NEW TITLE:", newPage.title);
console.log("DETECTED CHANGES:", changes);
console.log("EVENT WILL EMIT?:", changes.length > 0);
console.log("-----------------------------------------");

const hasChanges = changes.length > 0; // حطها طول هكا خاطرها Array

    return {
      data: newPage, 
      event: {
        type: PAGE_EVENTS.UPDATED,
        shouldEmit: hasChanges,
        payload: {
          current: newPage,
          previous: oldPage,
          changes: changes,
          // 🎯 الـ Context توة فيه كل المعلومات التعريفية
          context: {
            userId,
            siteId,
            eventId: crypto.randomUUID(), // الـ ID يتولد هوني مرة وحدة
            action: "update",
            timestamp: Date.now()
          },
          // 🎯 الـ Flags باش الـ Plugins يعرفوا رواحهم يخدموا ولا لا
          flags: {
            shouldVersion: changes.includes("content") || changes.includes("blocks"),
            shouldSEO: changes.includes("title")
          }
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
    // ... Logic الجلب والـ Restore ...
    const version = await PageVersion.findOne({ where: { id: versionId, pageId }, transaction: t });
    if (!version) throw new Error("VERSION_NOT_FOUND");

    const page = await Page.findByPk(pageId, { transaction: t });
    const oldPage = page.toJSON();

    // عملية الـ Restore الفعلية
    await page.update({ 
      content: version.content, 
      title: version.title,
      blocks: version.blocks 
    }, { transaction: t });

    return {
      data: page,
      event: {
        type: "page.restored", // 👈 نوع الحدث
        shouldEmit: true,
        payload: {
          siteId,
          userId,
          oldPage,
          newPage: page.toJSON(),
          versionId,
          _meta: { 
            eventId: crypto.randomUUID(), // 🛡️ الطابع البريدي
            timestamp: Date.now(),
            source: "PageService.restoreVersion"
          }
        }
      }
    };
  });
}
}
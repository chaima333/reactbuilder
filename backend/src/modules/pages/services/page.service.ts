
import slugify from "slugify";
import { PageRepository } from "../repositories/page.repository";
import { canPublish, canTransition, PAGE_STATUS } from "../domain/rules";
import { PageVersionRepository } from "../repositories/pageVersion.repository";
import { sequelize } from "../../../core/database/connection";
import { Page } from "../../../models/page";
import { SlugMap } from "../../../models/slug_map";
import { PageEngine } from "../engine/page.engine";
import { PAGE_EVENTS } from "../../../core/plugins/events/pageEvents";
import { cmsRegistry } from "../../../core/plugins/plugin.registry";
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

  // 🚀 أربط الصفحة بالـ SlugMap طول
  await SlugMap.create({
    siteId,
    slug,
    pageId: page.id,
    type: "page",
    isActive: true
  });

  return page;
}

  // ================= GET =================
  static async getPages(siteId: number) {
    return PageRepository.findAll(siteId);
  }

  // ================= UPDATE =================

static async updatePage(siteId: number, pageId: number, userId: number, input: any) {
  if (!pageId) {
    console.error("❌ [Service Error]: pageId is undefined!");
    throw new Error("PAGE_ID_REQUIRED");
  }

  let updated;
  let oldPage;
  let actions;

  await sequelize.transaction(async (t) => {
    const page = await Page.findOne({ where: { id: pageId, siteId }, transaction: t });
    if (!page) throw new Error("PAGE_NOT_FOUND");
    
    oldPage = page.toJSON();
    
    actions = PageEngine.resolveActions(oldPage, input);

    updated = await page.update(input, { transaction: t });

    await cmsRegistry.emit(
      PAGE_EVENTS.UPDATED, 
      {
        page: updated.toJSON(),
        oldPage,
        meta: { shouldVersion: actions.shouldVersion }, // 🧠 بعثنا الـ meta كـ Contract واضح
        userId,
        siteId,
        action: 'update'
      },
      "PageService.updatePage" // 👈 الـ Source الحقيقي
    );
  });

  return updated;
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

  // ================= RESTORE =================
  static async restoreVersion(siteId: number, pageId: number, versionId: number, userId: number) {
  return await sequelize.transaction(async (t) => {
    // 1. جيب الـ Version
    const version = await PageVersionRepository.findById(versionId, siteId);
    if (!version) throw new Error("VERSION_NOT_FOUND");

    // 2. جيب الـ Page
    const page = await Page.findOne({ where: { id: pageId, siteId }, transaction: t });
    if (!page) throw new Error("PAGE_NOT_FOUND");

    // نأخذ Snapshot قبل التعديل
    const oldPageSnapshot = page.toJSON();

    // 3. Update Page
    const restored = await page.update({
      title: version.title,
      content: version.content,
      blocks: version.blocks,
      status: PAGE_STATUS.DRAFT,
      metaData: { ...page.metaData, isRestored: true, lastVersionId: versionId }
    }, { transaction: t });

    // 4. 🔥 الـ Emit الموحد داخل الـ Transaction
    // ملاحظة: استعملنا restored و oldPageSnapshot اللي عرفناهم الفوق
    await cmsRegistry.emit(
      PAGE_EVENTS.RESTORED, 
      { 
        current: restored.toJSON(), 
        oldPage: oldPageSnapshot, 
        action: 'restore',
        siteId,
        userId
      },
      "PageService.restoreVersion"
    );

    return restored;
  });
}
}



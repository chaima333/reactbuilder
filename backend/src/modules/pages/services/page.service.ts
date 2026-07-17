import slugify from "slugify";
import { PageRepository } from "../repositories/page.repository";
import { canPublish, PAGE_STATUS } from "../domain/rules";
import { sequelize } from "../../../core/database/connection";
import { Page } from "../../../models/page";
import { SlugMap } from "../../../models/slug_map";
import { PAGE_EVENTS } from "../../../core/plugins/events/pageEvents";
import crypto from 'crypto';
import PageVersion from "../../../models/pageVersion";
import { updatePageHandler } from "../commands/updatePage.handler";
import { AdminSettingsService } from "../../admin/adminSettings.service";
import { Seo, Site } from "../../../models";

const { nanoid } = require("nanoid");

export class PageService {

 private static generateSlug(title: string) {
    return `${slugify(title, { lower: true, strict: true })}-${nanoid(5)}`;
  }

  // ================= CREATE =================
static async createPage(
  siteId: number,
  userId: number,
  data: any
) {
  const settings = await AdminSettingsService.getSettings();
  const maxPages = settings.maxPagesPerSite ?? 50;
  const currentPagesCount = await Page.count({
    where: { siteId }
  });

  if (currentPagesCount >= maxPages) {
    throw new Error("MAX_PAGES_LIMIT_REACHED");
  }

  const existing =
    await PageRepository.findByTitle(
      siteId,
      data.title
    );

  if (existing) {
    throw new Error("PAGE_ALREADY_EXISTS");
  }

  const slug =
    data.slug ||
    this.generateSlug(
      data.title
    );

  const requestedHomepage =
    data.isHomepage === true;

  if (requestedHomepage) {
    await Page.update(
      {
        isHomepage: false
      },
      {
        where: {
          siteId
        }
      }
    );
  }
 const visibility =
  data.visibility === "members_only"
    ? "members_only"
    : "public";

  const page =
    await PageRepository.create({
      ...data,
      slug,
      siteId,
      userId,
      status: data.status || PAGE_STATUS.DRAFT,
      visibility,
      isHomepage: requestedHomepage
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
      payload: {
        page: page.toJSON(),
        siteId,
        userId
      },
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
      source: "page.handler", 
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
        transaction: t,
        lock: t.LOCK.UPDATE
      });

      if (!page) throw new Error("PAGE_NOT_FOUND");
      if (!canPublish(userRole)) throw new Error("FORBIDDEN");

      //  idempotent publish
      if (page.status === PAGE_STATUS.PUBLISHED) {
        return {
          data: page,
          event: {
            type: PAGE_EVENTS.PUBLISHED,
            shouldEmit: false,
            payload: {
               page: page.toJSON(),
               current: page.toJSON(),
               siteId,
                userId,
               alreadyPublished: true         
            }
          }
        };
      }

      const old = page.toJSON();

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
      current: updated.toJSON(),
      previous: old,
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
    const page = await Page.findOne({
      where: { id: pageId, siteId },
      transaction: t,
      lock: t.LOCK.UPDATE
    });

    if (!page) {
      throw new Error("PAGE_NOT_FOUND");
    }

    const version = await PageVersion.findOne({
      where: {
        id: versionId,
        pageId,
        siteId
      },
      transaction: t
    });

    if (!version) {
      throw new Error("VERSION_NOT_FOUND");
    }

    const oldPage = page.toJSON();

    // Preserve the current state first so every restore can be undone.
    // Restore scope is intentionally limited to title, content, and blocks.
    await PageVersion.create({
      pageId: page.id,
      siteId,
      title: page.title,
      content: page.content,
      blocks: page.blocks,
      status: page.status,
      createdBy: userId
    }, { transaction: t });

    await page.update({ 
      content: version.content, 
      title: version.title,
      blocks: version.blocks 
    }, { transaction: t });

    const updatedPage = page.toJSON();

    return {
      data: page,
      event: {
        type: "page.restored",
        shouldEmit: true,
        payload: {
          context: {
            eventId: crypto.randomUUID(), 
            timestamp: Date.now(),
            action: "restore",
            userId: userId,
            siteId: siteId
          },
          source:"restore",
          current: updatedPage,  
          previous: oldPage,    
          changes: ["title", "content", "blocks"], 
          versionId: versionId 
        }
      }
    };
  });
}


static async getPageById(
  pageId: number,
  siteId: number
) {
  const page =
    await Page.findOne({
      where: {
        id: pageId,
        siteId
      },
      include: [
        {
          model: Seo,
          required: false
        }
      ]
    });

  if (!page) {
    return null;
  }

  const site =
    await Site.findByPk(siteId);

  const siteSettings =
    site?.get("settings") as any;

  const siteTheme =
    siteSettings?.theme || null;

  page.setDataValue(
    "theme" as any,
    siteTheme
  );

  return page;
}

static async updatePageSeo(
  siteId: number,
  pageId: number,
  input: any
) {
  const page =
    await Page.findOne({
      where: {
        id: pageId,
        siteId
      }
    });

  if (!page) {
    throw new Error("PAGE_NOT_FOUND");
  }

  const payload = {
    metaTitle:
      input.metaTitle || "",

    metaDescription:
      input.metaDescription || "",

    metaKeywords:
      input.metaKeywords || "",

    metaRobots:
      input.metaRobots || "index,follow",

    canonicalUrl:
      input.canonicalUrl || "",

    ogTitle:
      input.ogTitle || input.metaTitle || "",

    ogDescription:
      input.ogDescription || input.metaDescription || "",

    ogImage:
      input.ogImage || "",

    ogType:
      input.ogType || "website",

    twitterCard:
      input.twitterCard || "summary_large_image",

    twitterTitle:
      input.twitterTitle || input.ogTitle || input.metaTitle || "",

    twitterDescription:
      input.twitterDescription ||
      input.ogDescription ||
      input.metaDescription ||
      "",

    twitterImage:
      input.twitterImage || input.ogImage || ""
  };

  const existingSeo =
    await Seo.findOne({
      where: {
        pageId,
        siteId
      }
    });

  if (existingSeo) {
    const updated =
      await existingSeo.update(
        payload
      );

    return updated.toJSON();
  }

  const created =
    await Seo.create({
      pageId,
      siteId,
      ...payload
    });

  return created.toJSON();
}
}


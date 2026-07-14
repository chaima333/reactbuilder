import { AuthRequest } from "../../../shared/auth.util";
import { PageService } from "../services/page.service";
import { PageVersionService } from "../services/pageVersion.service";
import { PageMapper } from "../mappers/page.mapper";
import { EventDispatcher } from "../../../core/plugins/event.dispatcher";
import { Request, Response } from "express";


export const handleEventDispatch = async (
  result: any,
  source: string
) => {
  const eventPayload = result?.event;

  if (!eventPayload?.shouldEmit) {
    return;
  }

  const rawData =
    eventPayload.data ||
    eventPayload.payload ||
    {};

  const rawContext =
    eventPayload.context ||
    rawData.context ||
    {};

  const envelope = {
    type: eventPayload.type,

    data: rawData,

    context: {
      ...rawContext,

      userId:
        rawContext.userId ??
        rawData.userId ??
        rawData.payload?.userId,

      siteId:
        rawContext.siteId ??
        rawData.siteId ??
        rawData.payload?.siteId,
    },

    meta: eventPayload.meta || {
      eventId: crypto.randomUUID(),
      timestamp: Date.now(),
    },
  };

  await EventDispatcher.dispatch(
    envelope.type,
    envelope,
    source
  );

};

// ========================
// 🟢 CREATE PAGE
// ========================
export const createPage = async (req: AuthRequest, res: Response) => {
  try {
    const result = await PageService.createPage(
      req.siteContext.siteId,
      req.user.id,
      req.body
    );
    await handleEventDispatch(result, "PageController.createPage");
    return res.status(201).json({ success: true, data: PageMapper.toDTO(result.data) });
  } catch (err: any) {
    if (err?.message === "MAX_PAGES_LIMIT_REACHED") {
      return res.status(403).json({
        success: false,
        message: "MAX_PAGES_LIMIT_REACHED"
      });
    }

    console.error("CREATE_PAGE_ERROR", {
      name:
        err?.name,
      message:
        err?.message,
      errors:
        err?.errors,
      parent:
        err?.parent,
      original:
        err?.original
    });

    return res.status(500).json({
      success: false,
      message:
        err?.message,
      details:
        err?.errors
    });
  }
};

// ========================
// 🟢 GET PAGES
// ========================
export const getPages = async (req: AuthRequest, res: Response) => {
  try {
    const pages = await PageService.getPages(req.siteContext.siteId);
    return res.json({ success: true, data: PageMapper.toListDTO(pages) });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ========================
// 🟢 UPDATE PAGE
// ========================

const activeRequests = new Set<string>();

export const updatePage = async (req: AuthRequest, res: Response) => {
  const lockKey = `${req.siteContext.siteId}:${req.params.pageId}`;

  try {
    if (activeRequests.has(lockKey)) {
      console.log(` [CONTROLLER] Duplicate request blocked for Key: ${lockKey}`);
      return res.status(429).json({ 
        success: false, 
        message: "Action already in progress. Please wait." 
      });
    }

    activeRequests.add(lockKey);

    const result = await PageService.updatePage(
      Number(req.siteContext.siteId),
      Number(req.params.pageId),
      req.user.id,
      req.body
    );

    return res.json({
      success: true,
      data: PageMapper.toDTO(result.data)
    });

  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  } finally {
    setTimeout(() => {
      activeRequests.delete(lockKey);
    }, 500);
  }
};
// ========================
// 🟢 DELETE PAGE
// ========================
export const deletePage = async (req: AuthRequest, res: Response) => {
  try {
    const result = await PageService.deletePage(
      req.siteContext.siteId,
      Number(req.params.pageId)
    );
    await handleEventDispatch(result, "PageController.deletePage");
    return res.json({ success: true, message: "Page deleted" });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ========================
// 🟢 PUBLISH PAGE
// ========================
export const publishPageController = async (req: AuthRequest, res: Response) => {
  try {
    const result = await PageService.publishPage(
      req.siteContext.siteId,
      Number(req.params.pageId),
      req.siteContext.role,
      req.user.id
    );

  const publishEvent: any = result?.event;

console.log("[PAGE_PUBLISH_EVENT] before dispatch", {
  type: publishEvent?.type,
  shouldEmit: publishEvent?.shouldEmit,
  userId:
    publishEvent?.context?.userId ??
    publishEvent?.payload?.userId ??
    publishEvent?.payload?.context?.userId,
  siteId:
    publishEvent?.context?.siteId ??
    publishEvent?.payload?.siteId ??
    publishEvent?.payload?.context?.siteId,
  pageId: result?.data?.id,
});

    await handleEventDispatch(result, "PageController.publishPage");

    console.log("[PAGE_PUBLISH_EVENT] dispatch completed", {
      type: result?.event?.type,
      dispatched: result?.event?.shouldEmit === true,
      pageId: result?.data?.id
    });

    return res.json({ success: true, data: PageMapper.toDTO(result.data) });
  } catch (err: any) {
    const status = err.message === "FORBIDDEN" ? 403 : err.message === "INVALID_TRANSITION" ? 400 : 500;
    return res.status(status).json({ success: false, message: err.message });
  }
};

// ========================
// 🟢 RESTORE VERSION
// ========================
export const restorePageVersion = async (req: AuthRequest, res: Response) => {
  try {
    const result = await PageService.restoreVersion(
      Number(req.siteContext.siteId),
      Number(req.params.pageId),
      Number(req.params.versionId),
      req.user.id
    );

    await handleEventDispatch(result, "PageController.restorePageVersion");

    return res.json({ success: true, data: PageMapper.toDTO(result.data) });
  } catch (err: any) {
    if (err?.message === "PAGE_NOT_FOUND") {
      return res.status(404).json({
        success: false,
        message: "Page not found"
      });
    }

    if (err?.message === "VERSION_NOT_FOUND") {
      return res.status(404).json({
        success: false,
        message: "Version not found"
      });
    }

    return res.status(500).json({
      success: false,
      message: "Unable to restore page version"
    });
  }
};

// ========================
// 🟢 HISTORY
// ========================
export const getPageHistory = async (req: AuthRequest, res: Response) => {
  try {
    const history = await PageVersionService.getPageHistory(
      Number(req.params.pageId),
      req.siteContext.siteId
    );
    return res.json({ success: true, data: history });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ========================
// 🟢 GET SINGLE PAGE (For Editor)
// ========================
export const getPageById = async (req: AuthRequest, res: Response) => {
  try {
    const { pageId } = req.params;
    const siteId = req.siteContext.siteId;

    const page = await PageService.getPageById(Number(pageId), siteId);

    if (!page) {
      return res.status(404).json({ 
        success: false, 
        message: "Page not found in this site" 
      });
    }

    return res.json({ 
      success: true, 
      data: PageMapper.toDTO(page) 
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
};
export const updatePageSeo = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const seo =
      await PageService.updatePageSeo(
        Number(req.siteContext.siteId),
        Number(req.params.pageId),
        req.body
      );

    return res.json({
      success: true,
      data: seo
    });
  } catch (err: any) {
    if (err?.message === "PAGE_NOT_FOUND") {
      return res.status(404).json({
        success: false,
        message: "Page not found in this site"
      });
    }

    console.error("UPDATE_PAGE_SEO_ERROR", {
      message: err?.message,
      errors: err?.errors
    });

    return res.status(500).json({
      success: false,
      message: "Unable to update page SEO"
    });
  }
};
export const getPublicPageById = async (req: Request, res: Response) => {
  try {
    const siteId = Number(req.params.siteId);
    const pageId = Number(req.params.pageId);

    if (!siteId || !pageId) {
      return res.status(400).json({
        success: false,
        message: "siteId and pageId are required"
      });
    }

    const { Page, Seo, Site } = require("../../../models");
    
    const page = await Page.findOne({
      where: {
        id: pageId,
        siteId,
        status: "published"
      },
      include: [{ model: Seo, required: false }]
    });

    if (!page) {
      return res.status(404).json({
        success: false,
        message: "Page not found"
      });
    }

    const site = await Site.findByPk(siteId);
    const seoRecord = page.seo;
    const pageData = {
      ...page.toJSON(),
      seo: seoRecord?.toJSON() || null,
      site:
        site && typeof site.toJSON === "function"
          ? site.toJSON()
          : site
    };

    return res.status(200).json({
      success: true,
      data: pageData
    });
  } catch (error: any) {
    console.error("[PUBLIC_PAGE_BY_ID_ERROR]:", error.message);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error"
    });
  }
};

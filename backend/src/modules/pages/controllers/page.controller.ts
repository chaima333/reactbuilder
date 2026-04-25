import { Response } from "express";
import { AuthRequest } from "../../../shared/auth.util";

import { PageService } from "../services/page.service";
import { PageVersionService } from "../services/pageVersion.service";
import { PageWorkflowService } from "../services/PageWorkflowService";
import { SlugResolver } from "../services/slugResolver.service";
import { SEOBuilder } from "../engine/seoBuilder";
import { PageMapper } from "../mappers/page.mapper";
import { RedirectGraphEngine } from "../engine/redirectGraph.engine";
import { cmsRegistry } from "../../../core/plugins/plugin.registry";
import { PAGE_EVENTS } from "../../../core/plugins/events/pageEvents";

// ========================
// 🟢 CREATE PAGE
// ========================
export const createPage = async (req: AuthRequest, res: Response) => {
  try {
    const page = await PageService.createPage(
      req.siteContext.siteId,
      req.user.id,
      req.body
    );

    return res.status(201).json({
      success: true,
      data: PageMapper.toDTO(page)
    });

  } catch (err: any) {
    return res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

// ========================
// 🟢 GET PAGES
// ========================
export const getPages = async (req: AuthRequest, res: Response) => {
  try {
    const pages = await PageService.getPages(req.siteContext.siteId);

    return res.json({
      success: true,
      data: PageMapper.toListDTO(pages)
    });

  } catch (err: any) {
    return res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

// ========================
// 🟢 UPDATE PAGE
// ========================
export const updatePage = async (req: AuthRequest, res: Response) => {
  try {
    const { pageId } = req.params;
    const { siteId } = req.siteContext;

    // 1. تنفيذ الـ Business Logic (Pure DB)
    const result = await PageService.updatePage(
      Number(siteId), 
      Number(pageId), 
      req.body
    );

    // 2. الـ Orchestration: الـ Controller يقرر يخرج الـ Event توا
    // هكا نضمنوا إنو الـ Transaction متاع الـ DB سكرت صايي
    await cmsRegistry.emit(
      PAGE_EVENTS.UPDATED, 
      {
        page: result.updated,
        oldPage: result.oldPage,
        meta: { shouldVersion: result.shouldVersion },
        userId: req.user.id,
        siteId
      },
      "PageController.updatePage"
    );

    return res.json({ success: true, data: result.updated });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ========================
// 🟢 DELETE PAGE
// ========================
export const deletePage = async (req: AuthRequest, res: Response) => {
  try {
    await PageService.deletePage(
      req.siteContext.siteId,
      Number(req.params.pageId)
    );

    return res.json({
      success: true,
      message: "Page deleted"
    });

  } catch (err: any) {
    return res.status(500).json({
      success: false,
      message: err.message
    });
  }
};


// ========================
// 🟢 PUBLISH PAGE
// ========================
export const publishPageController = async (req: AuthRequest, res: Response) => {
  try {
    const page = await PageService.publishPage(
      req.siteContext.siteId,
      Number(req.params.pageId),
      req.siteContext.role,
      req.user.id
    );

    return res.json({
      success: true,
      data: PageMapper.toDTO(page)
    });

  } catch (err: any) {
    if (err.message === "FORBIDDEN") {
      return res.status(403).json({ success: false, message: "Forbidden" });
    }

    if (err.message === "INVALID_TRANSITION") {
      return res.status(400).json({ success: false, message: "Invalid transition" });
    }

    return res.status(500).json({
      success: false,
      message: err.message
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

    return res.json({
      success: true,
      data: history
    });

  } catch (err: any) {
    return res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

// ========================
// 🟢 RESTORE VERSION
// ========================
export const restorePageVersion = async (req: AuthRequest, res: Response) => {
  try {
    const { pageId, versionId } = req.params;
    const { siteId } = req.siteContext;

    // 1. Pure Restore
    const result = await PageService.restoreVersion(
      Number(siteId),
      Number(pageId),
      Number(versionId)
    );

    // 2. Explicit Emit
    await cmsRegistry.emit(
      PAGE_EVENTS.RESTORED, 
      { 
        current: result.restored, 
        oldPage: result.oldPage, 
        siteId,
        userId: req.user.id
      },
      "PageController.restoreVersion"
    );

    return res.json({ success: true, data: result.restored });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
};
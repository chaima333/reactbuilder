import { Response } from "express";
import { AuthRequest } from "../../../shared/auth.util";

import { PageService } from "../services/page.service";
import { PageVersionService } from "../services/pageVersion.service";
import { PageWorkflowService } from "../services/PageWorkflowService";
import { SlugResolver } from "../services/slugResolver.service";
import { SEOBuilder } from "../engine/seoBuilder";
import { PageMapper } from "../mappers/page.mapper";
import { RedirectGraphEngine } from "../engine/redirectGraph.engine";

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
    const userId = req.user.id;

    // 1. الأوركسترا تبدأ وتنتهي في الـ Service
    const updatedPage = await PageService.updatePage(siteId, pageId, userId, req.body);

    return res.json({
      success: true,
      data: PageMapper.toDTO(updatedPage) // 🔥 رجّع الصفحة اللي تعدلت موش كلمة history!
    });

  } catch (err: any) {
    return res.status(err.status || 500).json({
      success: false,
      message: err.message
    });
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

    const restoredPage = await PageVersionService.restoreVersion(
      Number(siteId),
      Number(pageId),
      Number(versionId)
    );

    return res.json({
      success: true,
      data: PageMapper.toDTO(restoredPage)
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
};
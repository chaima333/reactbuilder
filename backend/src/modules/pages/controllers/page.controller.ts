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
    const page = await PageService.updatePage(
      req.siteContext.siteId,
      Number(req.params.pageId),
      req.user.id,
      req.body
    );

    return res.json({
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
// 🟢 PUBLIC PAGE RESOLVER (CLEAN)
// ========================


export const getPublicPage = async (req, res) => {
  try {
    const siteId = Number(req.params.siteId);
    const inputSlug = req.params.slug;

    // 🚀 نعيطو للـ Graph Engine باش يعطينا الحقيقة من أول مرة
    const result = await RedirectGraphEngine.resolve(siteId, inputSlug);

    // 1️⃣ لو الـ Slug موش موجود جملة
    if (!result) {
      return res.status(404).json({
        error: "NOT_FOUND"
      });
    }

    // 2️⃣ لو الـ Slug اللي دخل هو "تاريخي" (Redirect)
    if (!result.isOriginal) {
      // ✅ نبعثوه للـ Frontend URL النظيف
      // الـ Browser توة باش يتبدل لـ: /pages/new-cool-slug
      return res.redirect(301, `/pages/${result.page.slug}`);
    }

    // 3️⃣ لو الـ Slug هو الصفحة الحالية (The Happy Path)
    return res.status(200).json({
      success: true,
      data: PageMapper.toDTO(result.page), // استعملنا الـ Mapper باش الداتا تكون نظيفة
      seo: SEOBuilder.build(result.page)
    });

  } catch (error: any) {
    // حماية من الـ Loops
    if (error.message === "REDIRECT_LOOP") {
      return res.status(508).json({ error: "Infinite redirect loop detected" });
    }
    
    return res.status(500).json({
      success: false,
      message: error.message
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
    const page = await PageWorkflowService.restoreVersion(
      req.siteContext.siteId,
      Number(req.params.pageId),
      Number(req.params.versionId)
    );

    return res.json({
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
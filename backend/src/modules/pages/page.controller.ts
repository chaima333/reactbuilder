import { Response, Request } from "express";
import { AuthRequest } from "../../shared/auth.util";
import { PageService } from "./page.service";
import { Page } from "../../models";
import PageSlug from "../../models/pageSlug";
import { PublicPageResolver } from "./engine/publicPageResolver";


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

    return res.status(201).json({ success: true, data: page });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
};


// ========================
// 🟢 GET PAGES
// ========================
export const getPages = async (req: AuthRequest, res: Response) => {
  try {
    const pages = await PageService.getPages(req.siteContext.siteId);
    return res.json({ success: true, data: pages });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
};


// ========================
// 🟢 UPDATE PAGE
// ========================
export const updatePage = async (req: AuthRequest, res: Response) => {
  try {
    const siteId = req.siteContext?.siteId || Number(req.params.siteId);

    const page = await PageService.updatePage(
      siteId,
      Number(req.params.pageId),
      req.user.id,
      req.body
    );

    return res.json({ success: true, data: page });
  } catch (err: any) {
    console.error("🔥 UPDATE PAGE ERROR:", err);

    return res.status(500).json({
      success: false,
      message: err.message || "Unknown error"
    });
  }
};


// ========================
// 🟢 DELETE PAGE
// ========================
export const deletePage = async (req: AuthRequest, res: Response) => {
  try {
    const siteId = req.siteContext.siteId;
    const { pageId } = req.params;

    const page = await Page.findOne({ where: { id: pageId, siteId } });
    if (!page) {
      return res.status(404).json({ success: false, message: "Page not found" });
    }

    await page.update({
      status: "deleted",
      slug: `deleted-${page.slug}-${Date.now()}`
    });

    return res.json({ success: true, message: "Page deleted" });

  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
};


// ========================
// 🟢 PUBLIC PAGE RESOLVER (NEW ARCH)
// ========================
export const getPublicPage = async (req: Request, res: Response) => {
  const { siteId, slug } = req.params;

  const result = await PublicPageResolver.resolve(
    Number(siteId),
    slug
  );

  if (result.type === "page") {
    return res.json({ success: true, data: result.data });
  }

  if (result.type === "redirect") {
    return res.redirect(
      301,
      `/api/public/pages/${siteId}/${result.to}`
    );
  }

  return res.status(404).json({
    success: false,
    message: "Page not found"
  });
};


// ========================
// 🟢 PUBLISH PAGE
// ========================
export const publishPageController = async (req: AuthRequest, res: Response) => {
  try {
    const siteId = req.siteContext.siteId;
    const role = req.siteContext.role;
    const userId = req.user.id;

    const page = await PageService.publishPage(
      siteId,
      Number(req.params.pageId),
      role,
      userId
    );

    return res.json({
      success: true,
      message: "Page published successfully",
      data: page
    });

  } catch (err: any) {
    if (err.message === "FORBIDDEN") {
      return res.status(403).json({ success: false, message: "Forbidden" });
    }

    if (err.message === "INVALID_TRANSITION") {
      return res.status(400).json({ success: false, message: "Invalid transition" });
    }

    return res.status(500).json({ success: false, message: err.message });
  }
};


// ========================
// 🟢 PAGE HISTORY
// ========================
export const getPageHistory = async (req: AuthRequest, res: Response) => {
  try {
    const history = await PageService.getPageHistory(
      Number(req.params.pageId),
      req.siteContext.siteId
    );

    return res.json({ success: true, data: history });

  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
};


// ========================
// 🟢 RESTORE VERSION
// ========================
export const restorePageVersion = async (req: AuthRequest, res: Response) => {
  try {
    const page = await PageService.restoreVersion(
      req.siteContext.siteId,
      Number(req.params.pageId),
      Number(req.params.versionId)
    );

    return res.json({
      success: true,
      message: "Page restored",
      data: page
    });

  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
};
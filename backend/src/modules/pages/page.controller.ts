import { Response, Request } from "express";
import { AuthRequest } from "../../shared/auth.util";
import { PageService } from "./page.service";
import { Page } from "../../models";
import { SlugResolver } from "./services/slugResolver.service";


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
  try {
    const { siteId, slug } = req.params;
    const result = await SlugResolver.resolve(Number(siteId), slug);

    // 1️⃣ الحالة الأولى: Slug صحيح ومطابق
    if (result.type === "page") {
      return res.status(200).json({ success: true, data: result.data });
    }

    // 2️⃣ الحالة الثانية: Slug قديم (Redirect)
    if (result.type === "redirect") {
      console.log(`🔀 SEO Redirect: ${slug} -> ${result.to}`);
      
      // 🔥 هذي هي الضربة القاضية: 301 Redirect
      // الـ Browser توّة يتبدل الـ URL متاعو وحدو لـ slug-v2-test
      return res.redirect(301, `/api/v2/magic-page/${siteId}/${result.to}`);
    }

    // 3️⃣ الحالة الثالثة: موش موجود
    return res.status(404).json({ success: false, message: "Page not found" });

  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
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
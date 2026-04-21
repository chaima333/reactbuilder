import { Response, Request } from "express";
import { AuthRequest } from "../../shared/auth.util";
import { PageService } from "./page.service";
import { Page } from "../../models";
import PageSlug from "../../models/pageSlug";

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

export const getPages = async (req: AuthRequest, res: Response) => {
  try {
    const pages = await PageService.getPages(req.siteContext.siteId);
    return res.json({ success: true, data: pages });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const updatePage = async (req: AuthRequest, res: Response) => {
  try {
    // 💡 تأمين الـ siteId: لو Context فارغ، خوذ الـ ID من الـ Params
    const siteId = req.siteContext?.siteId || Number(req.params.siteId);

    const page = await PageService.updatePage(
      siteId,
      Number(req.params.pageId),
      req.user.id,
      req.body
    );
    return res.json({ success: true, data: page });
  } catch (err: any) {
    // 💡 Log الحقيقة في الـ Terminal متاع Railway
    console.error("🔥 UPDATE PAGE CRASH:", err);

    const status = err.message === "PAGE_NOT_FOUND" ? 404 : 500;
    
    // 💡 نضمنو إنو الـ message ديما يرجع فيه حاجة
    return res.status(status).json({ 
      success: false, 
      message: err.message || err.name || "Unknown Database Error" 
    });
  }
};

export const deletePage = async (req: AuthRequest, res: Response) => {
  try {
    const siteId = req.siteContext.siteId;
    const { pageId } = req.params;
    const page = await Page.findOne({ where: { id: pageId, siteId } });
    if (!page) return res.status(404).json({ success: false, message: "Page not found" });

    await page.update({ 
      status: "deleted",
      slug: `deleted-${page.slug}-${Date.now()}` 
    });
    return res.json({ success: true, message: "Page deleted" });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const getPublicPage = async (req: Request, res: Response) => {
    const { siteId, slug } = req.params;

    let page = await Page.findOne({
        where: { slug, siteId, status: "published" }
    });

    if (page) return res.json({ success: true, data: page });

    const oldSlugRecord = await PageSlug.findOne({ where: { slug, siteId } });

    if (oldSlugRecord) {
        const currentPage = await Page.findByPk(oldSlugRecord.pageId);

        if (currentPage && currentPage.status === "published") {
            return res.redirect(301, `/api/sites/${siteId}/pages/public/${siteId}/${currentPage.slug}`);
        }
    }

    return res.status(404).json({ success: false, message: "Page not found" });
};

export const publishPageController = async (req: AuthRequest, res: Response) => {
  try {
    const siteId = req.siteContext.siteId;
    const role = req.siteContext.role; 
    const userId = req.user.id;
    const { pageId } = req.params;

    // ✅ بعثنا الـ 4 Arguments: siteId, pageId, role, userId
    const page = await PageService.publishPage(
      siteId,
      Number(pageId),
      role,
      userId
    );

    return res.json({
      success: true,
      message: "Page published successfully! 🚀",
      data: page,
    });
  } catch (err: any) {
    if (err.message === "FORBIDDEN") return res.status(403).json({ success: false, message: "Forbidden: Owner/Admin only" });
    if (err.message === "INVALID_TRANSITION") return res.status(400).json({ success: false, message: "Invalid state transition" });
    return res.status(500).json({ success: false, message: err.message });
  }
};

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

export const restorePageVersion = async (req: AuthRequest, res: Response) => {
  try {
    const page = await PageService.restoreVersion(
      req.siteContext.siteId,
      Number(req.params.pageId),
      Number(req.params.versionId)
    );
    return res.json({ 
      success: true, 
      message: "Page restored to old version! ⏪", 
      data: page 
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
};


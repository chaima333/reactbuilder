import { Response, Request } from "express";
import { AuthRequest } from "../../shared/auth.util";
import { PageService } from "./page.service";
import { Page } from "../../models";

// 1. إنشاء صفحة
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

// 2. جلب كل الصفحات
export const getPages = async (req: AuthRequest, res: Response) => {
  try {
    const pages = await PageService.getPages(req.siteContext.siteId);
    return res.json({ success: true, data: pages });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// 3. تحديث صفحة (تأكد إنو updatePage موجودة في الـ Service بنفس الـ Arguments)
export const updatePage = async (req: AuthRequest, res: Response) => {
  try {
    const page = await PageService.updatePage(
      req.siteContext.siteId,
      Number(req.params.pageId),
      req.user.id,
      req.body
    );
    return res.json({ success: true, data: page });
  } catch (err: any) {
    const status = err.message === "PAGE_NOT_FOUND" ? 404 : 500;
    return res.status(status).json({ success: false, message: err.message });
  }
};

// 4. حذف صفحة
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

// 5. جلب صفحة للعموم (Public)
export const getPublicPage = async (req: Request, res: Response) => {
  try {
    const { siteId, slug } = req.params;
    const page = await Page.findOne({
      where: { siteId, slug, status: "published" },
      attributes: ['id', 'title', 'content', 'blocks', 'slug', 'updatedAt'] 
    });
    if (!page) return res.status(404).json({ success: false, message: "Page not found" });
    return res.json({ success: true, data: page });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// 6. النشر (الـ Controller الصحيح اللي يبعث الـ 4 arguments)
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
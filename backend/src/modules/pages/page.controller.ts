import { Response, Request } from "express";
import { AuthRequest } from "../../shared/auth.util";
import { PageService } from "./page.service";
import { Page } from "../../models";

export const createPage = async (req: AuthRequest, res: Response) => {
  try {
    const { title } = req.body;
    if (!title) return res.status(400).json({ success: false, message: "title is required" });

    // مناداة الـ Service: تمرير الـ siteId من الـ Context لضمان الأمان
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

export const deletePage = async (req: AuthRequest, res: Response) => {
  try {
    const siteId = req.siteContext.siteId;
    const { pageId } = req.params;

    const page = await Page.findOne({ where: { id: pageId, siteId } });
    if (!page) return res.status(404).json({ success: false, message: "Page not found" });

    // تحرير الـ Slug عند الحذف باش ينجم حد آخر يستعمله
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
  try {
    const { siteId, slug } = req.params; // التعديل المعماري: البحث بـ siteId + slug

    const page = await Page.findOne({
      where: { 
        siteId, 
        slug, 
        status: "published" 
      },
      include: ["seo"]
    });

    if (!page) return res.status(404).json({ success: false, message: "Page not found" });

    return res.json({ success: true, data: page });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
};
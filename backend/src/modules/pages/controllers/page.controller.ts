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

// ========================
// 🟢 PUBLIC PAGE RENDERER (THE FINAL VERSION)
// ========================
export const getPublicPage = async (req, res) => {
  try {
    const siteId = Number(req.params.siteId);
    const inputSlug = req.params.slug;

    console.log(`[DEBUG] Handling Request - Site: ${siteId}, Slug: ${inputSlug}`);

    const result = await RedirectGraphEngine.resolve(siteId, inputSlug);

    // 1. إذا الصفحة غير موجودة
    if (!result || !result.page) {
      return res.status(404).send("<h1>404 - Page Not Found</h1>");
    }

    // 2. إذا كان الرابط قديم (Redirect 301)
    if (!result.isOriginal) {
      const target = `/pages/${siteId}/${result.page.slug}`;
      console.log(`[DEBUG] Redirecting to target: ${target}`);
      return res.redirect(301, target); 
    }

    // 3. بناء الـ SEO والـ Page Data
    const seo = SEOBuilder.build(result.page);
    const page = result.page;

    // 4. إعداد الـ Headers (Performance)
    res.set("Cache-Control", "public, max-age=60");

    // 5. إرسال HTML وليس JSON
    return res.status(200).send(`
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${seo.title}</title>
    <meta name="description" content="${seo.description}">
    <link rel="canonical" href="https://yourdomain.com/pages/${siteId}/${page.slug}" />
    <meta property="og:title" content="${seo.openGraph?.title || seo.title}">
    <style>
        body { font-family: 'Segoe UI', sans-serif; padding: 2rem; line-height: 1.6; color: #333; background: #f4f7f6; }
        .page-container { max-width: 800px; margin: auto; background: #fff; padding: 2rem; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
        h1 { color: #2c3e50; margin-top: 0; border-bottom: 2px solid #eee; padding-bottom: 0.5rem; }
        .content { font-size: 1.1rem; margin-top: 1.5rem; }
        footer { margin-top: 2rem; font-size: 0.8rem; color: #999; text-align: center; border-top: 1px solid #eee; padding-top: 1rem; }
    </style>
</head>
<body>
    <div class="page-container">
        <h1>${page.title}</h1>
        <div class="content">
            ${page.content}
        </div>
        <footer>
            Site ID: ${siteId} | Page ID: ${page.id} | Rendered at: ${new Date().toLocaleTimeString()}
        </footer>
    </div>
</body>
</html>
    `);

  } catch (error: any) {
    console.error("[DEBUG ERROR]", error.message);
    if (error.message === "REDIRECT_LOOP") {
      return res.status(508).send("<h1>508 - Loop Detected</h1>");
    }
    return res.status(500).send("<h1>500 - Server Error</h1>");
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
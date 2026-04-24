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
// 1️⃣ Security First: Escape HTML function
function escapeHTML(str: string) {
  if (!str) return "";
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

export const getPublicPage = async (req, res) => {
  try {
    const siteId = Number(req.params.siteId);
    const inputSlug = req.params.slug;

    const result = await RedirectGraphEngine.resolve(siteId, inputSlug);
    if (!result || !result.page) return res.status(404).send("<h1>404 Not Found</h1>");

    if (!result.isOriginal) return res.redirect(301, `/pages/${siteId}/${result.page.slug}`);

    const { page } = result;
    const seo = SEOBuilder.build(page);

    // 2️⃣ Dynamic Canonical & Host
    const host = req.get("host");
    const protocol = req.protocol;
    const canonical = `${protocol}://${host}/pages/${siteId}/${page.slug}`;

    // 3️⃣ Caching Strategy (1 minute)
    res.set("Cache-Control", "public, max-age=60");

    // 4️⃣ The Renderer (Starting to move away from raw strings)
    const renderMetaTags = () => `
        <title>${seo.title}</title>
        <meta name="description" content="${seo.description}">
        <link rel="canonical" href="${canonical}" />
        <meta property="og:title" content="${seo.openGraph?.title || seo.title}">
        <meta property="og:description" content="${seo.description}">
        <meta property="og:type" content="article">
        <meta property="og:url" content="${canonical}">
    `;

    return res.status(200).send(`
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    ${renderMetaTags()}
    <style>
        body { font-family: system-ui; padding: 2rem; line-height: 1.5; background: #fafafa; }
        .container { max-width: 800px; margin: auto; background: white; padding: 2rem; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
    </style>
</head>
<body>
    <div class="container">
        <h1>${escapeHTML(page.title)}</h1>
        <div class="content">
            ${escapeHTML(page.content)}
        </div>
        <hr />
        <div id="blocks-area">
            ${renderBlocks(page.blocks)}
        </div>
    </div>
</body>
</html>
    `);

  } catch (error: any) {
    return res.status(500).send("Internal Server Error");
  }
};

// 5️⃣ الـ Seed متاع الـ Block Renderer
function renderBlocks(blocks: any[]) {
    if (!blocks || !blocks.length) return "";
    return blocks.map(block => {
        switch(block.type) {
            case 'hero': return `<section class="hero"><h2>${escapeHTML(block.data.text)}</h2></section>`;
            case 'text': return `<p>${escapeHTML(block.data.content)}</p>`;
            default: return ``;
        }
    }).join('');
}

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
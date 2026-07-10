// backend/src/modules/sites/site.export.controller.ts

import { Request, Response } from "express";
import { CmsCollection, CmsEntry, Page, Site } from "../../../models";
import { resolveBindings } from "../../cms/utils/binding.resolver";
import { SEOBuilder } from "../../pages/engine/seoBuilder";
import { renderBlocks, renderFullPage } from "../../pages/engine/blockRenderer";

// ✅ استعمل require بدل import
const archiver = require('archiver');

export const exportSite = async (req: Request, res: Response) => {
  try {
    const siteId = Number(req.params.siteId);

    if (!siteId) {
      return res.status(400).json({
        success: false,
        message: "siteId is required"
      });
    }

    const site = await Site.findByPk(siteId);
    if (!site) {
      return res.status(404).json({
        success: false,
        message: "Site not found"
      });
    }

    const pages = await Page.findAll({
      where: {
        siteId,
        status: "published"
      }
    });

    const collections = await CmsCollection.findAll({
      where: { siteId },
      include: [{ model: CmsEntry, required: false }]
    });

    const htmlPages: Record<string, string> = {};

    for (const page of pages) {
      const pageData = page.toJSON();
      
      const resolvedBlocks = resolveBindings(pageData.blocks || [], pageData);
      
      const seo = SEOBuilder.build(pageData);
      const blocksHTML = await renderBlocks(resolvedBlocks, siteId);
      const html = renderFullPage(
        pageData,
        seo,
        `/site/${siteId}/${pageData.slug}`,
        blocksHTML
      );
      
      const filename = pageData.slug === "home" ? "index" : pageData.slug;
      htmlPages[`${filename}.html`] = html;
    }

    const cmsData = {
      collections: collections.map(c => c.toJSON())
    };

    // ✅ archiver يخدم مع require
    const archive = archiver("zip", { zlib: { level: 9 } });
    
    const siteName = site.get("name") || "site";
    res.attachment(`${siteName}-export.zip`);
    archive.pipe(res);

    for (const [filename, html] of Object.entries(htmlPages)) {
      archive.append(html, { name: filename });
    }

    archive.append(JSON.stringify(cmsData, null, 2), { name: "cms-data.json" });

    archive.append(JSON.stringify({
      site: {
        id: site.id,
        name: site.get("name"),
        slug: site.get("slug"),
        exportedAt: new Date().toISOString()
      }
    }, null, 2), { name: "site-info.json" });

    await archive.finalize();

  } catch (error) {
    console.error("EXPORT_SITE_ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to export site"
    });
  }
};
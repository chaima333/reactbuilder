import { Request, Response } from "express";
import { RedirectGraphEngine } from "../engine/redirectGraph.engine";
import { SEOBuilder } from "../engine/seoBuilder";
import { renderBlocks, renderFullPage } from "../engine/blockRenderer";

export const getPublicPage = async (req: Request, res: Response) => {
  try {
    const siteId = Number(req.params.siteId);
    const inputSlug = req.params.slug;

    // 1. التثبت من وجود الصفحة أو تحويل المسار
    const result = await RedirectGraphEngine.resolve(siteId, inputSlug);
    
    if (!result || !result.page) {
      return res.status(404).send("<h1>404 - Page Not Found</h1>");
    }

    // 2. Redirect 301 لو الـ Slug قديم
    if (!result.isOriginal) {
      return res.redirect(301, `/pages/${siteId}/${result.page.slug}`);
    }

    const { page } = result;
    const seo = SEOBuilder.build(page);
    
    // 3. بناء الرابط الأصلي (Canonical)
    const host = req.get("host");
    const protocol = req.protocol;
    const canonical = `${protocol}://${host}/pages/${siteId}/${page.slug}`;

    // 4. تفعيل الـ Cache لمدة دقيقة
    res.set("Cache-Control", "public, max-age=60");
    
    // 5. عملية الـ Rendering
    const blocksHTML = renderBlocks(page.blocks);
    const html = renderFullPage(page, seo, canonical, blocksHTML);

    // 6. إرسال الصفحة النهائية
    return res.status(200).send(html);

  } catch (error: any) {
    console.error("[RENDER_ERROR]:", error.message);
    return res.status(500).send("<h1>500 - Internal Server Error</h1>");
  }
};
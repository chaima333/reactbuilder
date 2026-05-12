import { Request, Response } from "express";
import { RedirectGraphEngine } from "../engine/redirectGraph.engine";
import { SEOBuilder } from "../engine/seoBuilder";
import { renderBlocks, renderFullPage } from "../engine/blockRenderer";

export const getPublicPage = async (req: Request, res: Response) => {
  try {
    const siteId = Number(req.params.siteId);
    const inputSlug = req.params.slug;

    const result = await RedirectGraphEngine.resolve(siteId, inputSlug);
    
    if (!result || !result.page) {
      return res.status(404).send("<h1>404 - Page Not Found</h1>");
    }

    if (!result.isOriginal) {
      return res.redirect(301, `/pages/${siteId}/${result.page.slug}`);
    }

    const { page } = result;
    const seo = SEOBuilder.build(page);
    
    const host = req.get("host");
    const protocol = req.protocol;
    const canonical = `${protocol}://${host}/pages/${siteId}/${page.slug}`;

    res.set("Cache-Control", "public, max-age=60");
    
    const blocksHTML = renderBlocks(page.blocks);
    const html = renderFullPage(page, seo, canonical, blocksHTML);

    return res.status(200).send(html);

  } catch (error: any) {
    console.error("[RENDER_ERROR]:", error.message);
    return res.status(500).send("<h1>500 - Internal Server Error</h1>");
  }

  
};
export const getPublicPageJSON = async (
  req: Request,
  res: Response
) => {
  try {
    const siteId =
      Number(
        req.params.siteId
      );
    const inputSlug =
      req.params.slug;
    const result =
      await RedirectGraphEngine.resolve(
        siteId,
        inputSlug
      );
    if (
      !result ||
      !result.page
    ) {
      return res
        .status(404)
        .json({
          success:false,
          message:
            "Page not found"
        });
    }
    const { page } =
      result;
    return res.json({
      success:true,
      data: page
    });
  } catch (error:any) {
    console.error(
    "[PUBLIC_PAGE_JSON_ERROR]:",
      error.message
    );
    return res
      .status(500)
      .json({
       success:false,
        message:
          "Internal Server Error"
      });
  }
};
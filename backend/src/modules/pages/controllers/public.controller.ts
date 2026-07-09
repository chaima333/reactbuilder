import { Request, Response } from "express";
import { RedirectGraphEngine } from "../engine/redirectGraph.engine";
import { SEOBuilder } from "../engine/seoBuilder";
import { renderBlocks, renderFullPage } from "../engine/blockRenderer";
import { Site } from "../../../models/site";
import { Seo } from "../../../models/Seo";

export const getPublicPage = async (req: Request, res: Response) => {
  try {
    const siteId =
      Number(req.params.siteId);

    const inputSlug =
      req.params.slug;

    const result =
      await RedirectGraphEngine.resolve(
        siteId,
        inputSlug
      );

    if (!result || !result.page) {
      return res.status(404).send("<h1>404 - Page Not Found</h1>");
    }

    if (!result.isOriginal) {
      return res.redirect(301, `/pages/${siteId}/${result.page.slug}`);
    }

    const rawPage =
  typeof result.page.toJSON === "function"
    ? result.page.toJSON()
    : result.page;

const seoRecord =
  await Seo.findOne({
    where: {
      pageId: rawPage.id,
      siteId: rawPage.siteId,
    },
  });

const page = {
  ...rawPage,
  seo:
    typeof seoRecord?.toJSON === "function"
      ? seoRecord.toJSON()
      : seoRecord,
};

const seo =
  SEOBuilder.build(page);

    const host =
      req.get("host");

    const protocol =
      req.protocol;

    const canonical =
      `${protocol}://${host}/pages/${siteId}/${page.slug}`;

    res.set("Cache-Control", "public, max-age=60");

    const site =
      await Site.findByPk(
        page.siteId
      );

    const globalLayout =
      site?.get("globalLayout") || {};

    const pageBlocks =
      Array.isArray(page.blocks) ? page.blocks : [];
    const isFooterBlock = (block: any) => {
      const semanticType =
        block?.meta?.semanticType ||
        block?.data?.meta?.semanticType;

      return (
        block?.type === "footer" ||
        block?.id?.startsWith("footer-section-") ||
        semanticType === "FOOTER" ||
        semanticType === "FOOTER_SECTION"
      );
    };

    const pageOwnsNavbar =
      pageBlocks.some((block: any) => block?.type === "navbar");
    const pageOwnsFooter =
      pageBlocks.some(isFooterBlock);

    const allBlocks = [
      ...(globalLayout.navbar && !pageOwnsNavbar
        ? [globalLayout.navbar]
        : []),
      ...pageBlocks,
      ...(globalLayout.footer && !pageOwnsFooter
        ? [globalLayout.footer]
        : [])
    ];

const blocksHTML = await renderBlocks(allBlocks, siteId);

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
      Number(req.params.siteId);

    const inputSlug =
      req.params.slug;

    const result =
      await RedirectGraphEngine.resolve(
        siteId,
        inputSlug
      );

    if (!result || !result.page) {
      return res.status(404).json({
        success: false,
        message: "Page not found"
      });
    }

    const { page } =
      result;

    const site =
      await Site.findByPk(
        page.siteId
      );

    return res.json({
      success: true,
      data: {
        ...page.toJSON(),
        site
      }
    });
  } catch (error: any) {
    console.error(
      "[PUBLIC_PAGE_JSON_ERROR]:",
      error.message
    );

    return res.status(500).json({
      success: false,
      message: "Internal Server Error"
    });
  }
};

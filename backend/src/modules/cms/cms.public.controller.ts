// cms.public.controller.ts
import { Request, Response } from "express";
import { CmsService } from "./cms.service";
import { CmsDetailService } from "./cmsDetail.service";
import { renderBlocks, renderFullPage } from "../pages/engine/blockRenderer";
import { SEOBuilder } from "../pages/engine/seoBuilder";
import { Site } from "../../models/site";

const isNavbarBlock = (
  block: any
) => {
  const searchText = [
    block?.type,
    block?.id,
    block?.meta?.semanticType,
    block?.data?.meta?.semanticType,
    block?.props?.tagName,
    block?.data?.props?.tagName,
    block?.props?.className,
    block?.data?.props?.className
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  return (
    block?.type === "navbar" ||
    searchText.includes("navbar") ||
    searchText.includes("site-header") ||
    searchText.includes("main-nav") ||
    block?.props?.tagName === "nav" ||
    block?.data?.props?.tagName === "nav"
  );
};

const isFooterBlock = (
  block: any
) => {
  const searchText = [
    block?.type,
    block?.id,
    block?.meta?.semanticType,
    block?.data?.meta?.semanticType,
    block?.props?.tagName,
    block?.data?.props?.tagName,
    block?.props?.className,
    block?.data?.props?.className
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  return (
    block?.type === "footer" ||
    searchText.includes("footer") ||
    block?.props?.tagName === "footer" ||
    block?.data?.props?.tagName === "footer"
  );
};
export class CmsPublicController {
  static getPublishedEntries = async (req: Request, res: Response) => {
    try {
      const siteId = Number(req.params.siteId);
      const slug = String(req.params.collectionSlug || "").trim();

      if (!siteId || !slug) {
        return res.status(400).json({
          success: false,
          message: "Invalid siteId or collection slug"
        });
      }

      const data = await CmsService.getPublishedEntriesByCollectionSlug(
        siteId,
        slug
      );

      return res.json({
        success: true,
        data
      });
    } catch (error) {
      if (error instanceof Error && error.message === "COLLECTION_NOT_FOUND") {
        return res.status(404).json({
          success: false,
          message: "CMS collection not found"
        });
      }

      console.error("PUBLIC_CMS_ENTRIES_ERROR", error);

      return res.status(500).json({
        success: false,
        message: "Failed to load CMS entries"
      });
    }
  };

  static getPublishedEntry = async (
  req: Request,
  res: Response
) => {
  try {
    const siteId = Number(req.params.siteId);

    const collectionSlug = String(
      req.params.collectionSlug || ""
    ).trim();

    const entrySlug = String(
      req.params.entrySlug || ""
    ).trim();

    const data =
      await CmsDetailService.resolvePublicDetail(
        siteId,
        collectionSlug,
        entrySlug
      );

    return res.json({
      success: true,
      data
    });
  } catch (error) {

    if (
      error instanceof Error &&
      (
        error.message === "CMS_PUBLIC_ENTRY_NOT_FOUND" ||
        error.message === "CMS_TEMPLATE_NOT_CONFIGURED" ||
        error.message === "CMS_TEMPLATE_NOT_PUBLIC"
      )
    ) {
      return res.status(404).json({
        success: false,
        code: "CMS_PUBLIC_ENTRY_NOT_FOUND"
      });
    }

    console.error(error);

    return res.status(500).json({
      success: false
    });
  }
};
static getPublishedEntryHtml = async (
  req: Request,
  res: Response
) => {
  try {
    const siteId =
      Number(req.params.siteId);

    const collectionSlug =
      String(
        req.params.collectionSlug || ""
      ).trim();

    const entrySlug =
      String(
        req.params.entrySlug || ""
      ).trim();

    if (
      !siteId ||
      !collectionSlug ||
      !entrySlug
    ) {
      return res
        .status(400)
        .send(
          "<h1>400 - Invalid CMS URL</h1>"
        );
    }

    const entry =
      await CmsDetailService
        .resolvePublicDetail(
          siteId,
          collectionSlug,
          entrySlug
        );

    const site =
      await Site.findByPk(
        siteId
      );

    if (!site) {
      return res
        .status(404)
        .send(
          "<h1>404 - Site Not Found</h1>"
        );
    }

    const siteData =
      typeof (site as any).toJSON ===
      "function"
        ? (site as any).toJSON()
        : site;

    const entryData =
      entry.data || {};

    const title =
      entryData.title ||
      entry.slug ||
      "CMS Entry";

    const description =
      entryData.description ||
      entryData.excerpt ||
      "";

    const image =
      entryData.featuredImage ||
      entryData.image ||
      null;

    const siteName =
      siteData.title ||
      siteData.name ||
      "Website";

    const keywords =
      Array.isArray(
        entryData.keywords
      )
        ? entryData.keywords.join(", ")
        : String(
            entryData.keywords || ""
          );

    const forwardedProtocol =
      req
        .get("x-forwarded-proto")
        ?.split(",")[0]
        ?.trim();

    const protocol =
      forwardedProtocol ||
      req.protocol;

    const host =
      req.get("host") || "";

    const publicBaseUrl =
      String(
        process.env.PUBLIC_SITE_URL ||
        process.env.FRONTEND_URL ||
        `${protocol}://${host}`
      ).replace(/\/+$/, "");

    const canonicalUrl =
      `${publicBaseUrl}` +
      `/site/${siteId}` +
      `/${collectionSlug}` +
      `/${entrySlug}`;

    const templateBlocks =
      Array.isArray(
        entry.template?.blocks
      )
        ? entry.template.blocks
        : [];

    const resolvedBlocks =
      templateBlocks;

    const globalLayout =
      siteData.globalLayout || {};

    const pageOwnsNavbar =
      resolvedBlocks.some(
        isNavbarBlock
      );

    const pageOwnsFooter =
      resolvedBlocks.some(
        isFooterBlock
      );

    const allBlocks = [
      ...(
        globalLayout.navbar &&
        !pageOwnsNavbar
          ? [globalLayout.navbar]
          : []
      ),

      ...resolvedBlocks,

      ...(
        globalLayout.footer &&
        !pageOwnsFooter
          ? [globalLayout.footer]
          : []
      )
    ];

    const dynamicPage = {
      id:
        entry.template?.pageId ||
        entry.id,

      siteId,

      title,

      slug: entrySlug,

      status: "published",

      blocks:
        resolvedBlocks,

      theme:
        siteData.theme ||
        siteData.settings?.theme ||
        {},

      language:
        siteData.language ||
        siteData.locale ||
        "en",

      seo: {
        metaTitle:
          `${title} | ${siteName}`,

        metaDescription:
          description,

        metaKeywords:
          keywords,

        metaRobots:
          "index,follow",

        canonicalUrl,

        ogTitle:
          title,

        ogDescription:
          description,

        ogImage:
          image,

        ogType:
          "article",

        twitterCard:
          "summary_large_image",

        twitterTitle:
          title,

        twitterDescription:
          description,

        twitterImage:
          image
      }
    };

    const seo =
      SEOBuilder.build(
        dynamicPage
      );

    const blocksHTML =
      await renderBlocks(
        allBlocks,
        siteId
      );

    const html =
      renderFullPage(
        dynamicPage,
        seo,
        canonicalUrl,
        blocksHTML
      );

    res.set(
      "Cache-Control",
      "public, max-age=60"
    );

    return res
      .status(200)
      .send(html);
  } catch (error) {
    if (
      error instanceof Error &&
      (
        error.message ===
          "CMS_PUBLIC_ENTRY_NOT_FOUND" ||
        error.message ===
          "CMS_TEMPLATE_NOT_CONFIGURED" ||
        error.message ===
          "CMS_TEMPLATE_NOT_PUBLIC"
      )
    ) {
      return res
        .status(404)
        .send(
          "<h1>404 - CMS Entry Not Found</h1>"
        );
    }

    console.error(
      "PUBLIC_CMS_ENTRY_HTML_ERROR",
      error
    );

    return res
      .status(500)
      .send(
        "<h1>500 - Internal Server Error</h1>"
      );
  }
};
}


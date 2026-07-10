import {
  Request,
  Response,
} from "express";

import archiver = require("archiver");
import {
  Page,
  Site,
} from "../../../models";

import {
  Seo,
} from "../../../models/Seo";

import {
  resolveBindings,
} from "../../cms/utils/binding.resolver";

import {
  SEOBuilder,
} from "../../pages/engine/seoBuilder";

import {
  renderBlocks,
  renderFullPage,
} from "../../pages/engine/blockRenderer";

type ExportedPageInfo = {
  id: number;
  title: string;
  slug: string;
  file: string;
  url: string | null;
};

const normalizeBaseUrl = (
  value: unknown
): string => {
  const raw =
    String(value || "")
      .trim();

  if (!raw) {
    return "";
  }

  try {
    const parsed =
      new URL(raw);

    if (
      parsed.protocol !== "http:" &&
      parsed.protocol !== "https:"
    ) {
      return "";
    }

    return `${parsed.protocol}//${parsed.host}`;
  } catch {
    return "";
  }
};

const normalizeSlug = (
  value: unknown,
  fallback: string
): string => {
  const raw =
    String(value || "")
      .trim()
      .replace(
        /^\/+|\/+$/g,
        ""
      );

  if (!raw) {
    return fallback;
  }

  const safeSegments =
    raw
      .split("/")
      .map((segment) =>
        segment
          .replace(
            /[<>:"\\|?*\u0000-\u001F]/g,
            "-"
          )
          .replace(
            /\.+$/g,
            ""
          )
          .trim()
      )
      .filter(Boolean);

  return (
    safeSegments.join("/") ||
    fallback
  );
};

const isHomeSlug = (
  slug: string
): boolean => {
  return (
    slug === "home" ||
    slug === "index"
  );
};

const getArchivePath = (
  slug: string
): string => {
  if (isHomeSlug(slug)) {
    return "index.html";
  }

  return `${slug}/index.html`;
};

const getPublicPath = (
  slug: string
): string => {
  if (isHomeSlug(slug)) {
    return "/";
  }

  return `/${slug}/`;
};

const buildAbsoluteUrl = (
  baseUrl: string,
  publicPath: string
): string => {
  if (!baseUrl) {
    return "";
  }

  return `${baseUrl}${publicPath}`;
};

const escapeXml = (
  value: unknown
): string => {
  return String(value ?? "")
    .replace(
      /&/g,
      "&amp;"
    )
    .replace(
      /</g,
      "&lt;"
    )
    .replace(
      />/g,
      "&gt;"
    )
    .replace(
      /"/g,
      "&quot;"
    )
    .replace(
      /'/g,
      "&apos;"
    );
};

const normalizePriority = (
  value: unknown
): number => {
  const numericValue =
    Number(value);

  if (
    !Number.isFinite(
      numericValue
    )
  ) {
    return 0.5;
  }

  return Math.min(
    1,
    Math.max(
      0,
      numericValue
    )
  );
};

const sanitizeDownloadName = (
  value: unknown
): string => {
  const result =
    String(value || "site")
      .trim()
      .replace(
        /[^a-zA-Z0-9-_]+/g,
        "-"
      )
      .replace(
        /-+/g,
        "-"
      )
      .replace(
        /^-|-$/g,
        ""
      );

  return result || "site";
};

const isFooterBlock = (
  block: any
): boolean => {
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

const composePageBlocksWithGlobalLayout = (
  pageBlocks: any[],
  globalLayout: any
): any[] => {
  const blocks =
    Array.isArray(pageBlocks)
      ? pageBlocks
      : [];

  const pageOwnsNavbar =
    blocks.some(
      (block: any) => block?.type === "navbar"
    );

  const pageOwnsFooter =
    blocks.some(isFooterBlock);

  return [
    ...(
      globalLayout?.navbar &&
      !pageOwnsNavbar
        ? [globalLayout.navbar]
        : []
    ),
    ...blocks,
    ...(
      globalLayout?.footer &&
      !pageOwnsFooter
        ? [globalLayout.footer]
        : []
    ),
  ];
};

export const exportSite = async (
  req: Request,
  res: Response
) => {
  try {
    const siteId =
      Number(
        req.params.siteId
      );

    if (
      !Number.isInteger(siteId) ||
      siteId <= 0
    ) {
      return res
        .status(400)
        .json({
          success: false,
          message:
            "A valid siteId is required",
        });
    }

    const baseUrl =
      normalizeBaseUrl(
        req.query.baseUrl
      );

    const site =
      await Site.findByPk(
        siteId
      );

    if (!site) {
      return res
        .status(404)
        .json({
          success: false,
          message:
            "Site not found",
        });
    }

    const pages =
      await Page.findAll({
        where: {
          siteId,
          status: "published",
        },

        include: [
          {
            model: Seo,
            required: false,
          },
        ],

        order: [
          [
            "createdAt",
            "ASC",
          ],
        ],
      });

    if (
      pages.length === 0
    ) {
      return res
        .status(422)
        .json({
          success: false,
          message:
            "The site has no published pages to export",
        });
    }

    const htmlPages:
      Record<string, string> =
        {};

    const exportedPages:
      ExportedPageInfo[] = [];

    const sitemapEntries:
      string[] = [];

    const siteData =
      typeof site.toJSON === "function"
        ? site.toJSON() as any
        : site as any;

    const globalLayout =
      site.get("globalLayout") || {};

    const siteSettings =
      site.get("settings") as any;

    const siteTheme =
      siteData?.theme ||
      siteSettings?.theme ||
      siteData?.settings?.theme;

    for (
      const page of pages
    ) {
      const pageData =
        page.toJSON() as any;

      const slug =
        normalizeSlug(
          pageData.slug,
          `page-${pageData.id}`
        );

      const archivePath =
        getArchivePath(
          slug
        );

      const publicPath =
        getPublicPath(
          slug
        );

      const exportedCanonical =
        buildAbsoluteUrl(
          baseUrl,
          publicPath
        );

      const exportPageData = {
        ...pageData,

        site:
          siteData,

        globalLayout,

        theme:
          pageData.theme ||
          siteTheme,

        seo: {
          ...(
            pageData.seo ||
            {}
          ),

          canonicalUrl:
            exportedCanonical ||
            pageData.seo
              ?.canonicalUrl ||
            "",
        },
      };

      const resolvedBlocks =
        resolveBindings(
          composePageBlocksWithGlobalLayout(
            exportPageData.blocks,
            globalLayout
          ),
          exportPageData
        );

      const seo =
        SEOBuilder.build(
          exportPageData
        );

      const blocksHTML =
        await renderBlocks(
          resolvedBlocks,
          siteId
        );

      const html =
        renderFullPage(
          exportPageData,
          seo,
          exportedCanonical,
          blocksHTML
        );

      htmlPages[
        archivePath
      ] = html;

      exportedPages.push({
        id:
          pageData.id,

        title:
          pageData.title ||
          "Untitled page",

        slug,

        file:
          archivePath,

        url:
          exportedCanonical ||
          null,
      });

      if (
        exportedCanonical
      ) {
        const priority =
          normalizePriority(
            seo?.sitemap
              ?.priority
          );

        const changefreq =
          seo?.sitemap
            ?.changefreq ||
          "weekly";

        const updatedAt =
          pageData.updatedAt
            ? new Date(
                pageData
                  .updatedAt
              )
                .toISOString()
            : new Date()
                .toISOString();

        sitemapEntries.push(`
  <url>
    <loc>${escapeXml(
      exportedCanonical
    )}</loc>
    <lastmod>${escapeXml(
      updatedAt
    )}</lastmod>
    <changefreq>${escapeXml(
      changefreq
    )}</changefreq>
    <priority>${priority.toFixed(
      1
    )}</priority>
  </url>`);
      }
    }

    const warnings:
      string[] = [];

    if (!baseUrl) {
      warnings.push(
        "No baseUrl was supplied. sitemap.xml was not generated and canonical URLs may remain empty."
      );
    }

    warnings.push(
      "Media files are not localized yet. Remote media URLs may still depend on ReactBuilder storage."
    );

    warnings.push(
      "This is a static export. A standalone CMS backend and database are not included yet."
    );

    const manifest = {
      version: 1,

      mode:
        "static",

      exportedAt:
        new Date()
          .toISOString(),

      site: {
        id:
          site.id,

        name:
          site.get(
            "name"
          ),

        baseUrl:
          baseUrl ||
          null,
      },

      pages:
        exportedPages,

      features: {
        staticHtml:
          true,

        seo:
          true,

        sitemap:
          Boolean(
            baseUrl
          ),

        robots:
          true,

        localMedia:
          false,

        cmsRuntime:
          false,

        formsRuntime:
          false,
      },

      warnings,
    };

    const robotsContent =
      [
        "User-agent: *",
        "Allow: /",

        baseUrl
          ? `Sitemap: ${baseUrl}/sitemap.xml`
          : "",

        "",
      ]
        .filter(Boolean)
        .join("\n");

    const sitemapContent =
      `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemapEntries.join("")}
</urlset>`;

    const siteName =
      sanitizeDownloadName(
        site.get(
          "name"
        )
      );

    res.attachment(
      `${siteName}-static-export.zip`
    );

    res.setHeader(
      "Content-Type",
      "application/zip"
    );

    const archive =
      archiver("zip", {
        zlib: {
          level: 9,
        },
      });

    await new Promise<void>(
      (resolve, reject) => {
        let settled = false;

        const fail = (
          error: unknown
        ) => {
          if (settled) {
            return;
          }

          settled = true;

          reject(
            error instanceof Error
              ? error
              : new Error(
                  String(error)
                )
          );
        };

        const succeed = () => {
          if (settled) {
            return;
          }

          settled = true;
          resolve();
        };

        archive.on(
          "warning",
          (warning: any) => {
            if (
              warning?.code ===
              "ENOENT"
            ) {
              console.warn(
                "EXPORT_ARCHIVE_WARNING",
                warning
              );

              return;
            }

            fail(warning);
          }
        );

        archive.once(
          "error",
          fail
        );

        res.once(
          "error",
          fail
        );

        res.once(
          "finish",
          succeed
        );

        res.once(
          "close",
          () => {
            if (
               !res.writableFinished
            ) {
              fail(
                new Error(
                  "Export response closed before ZIP generation completed"
                )
              );
            }
          }
        );

        archive.pipe(res);

        for (
          const [
            filename,
            html,
          ] of Object.entries(
            htmlPages
          )
        ) {
          archive.append(
            html,
            {
              name: filename,
            }
          );
        }

        archive.append(
          robotsContent,
          {
            name:
              "robots.txt",
          }
        );

        if (baseUrl) {
          archive.append(
            sitemapContent,
            {
              name:
                "sitemap.xml",
            }
          );
        }

        archive.append(
          JSON.stringify(
            manifest,
            null,
            2
          ),
          {
            name:
              "export-manifest.json",
          }
        );

        archive
          .finalize()
          .catch(fail);
      }
    );
  } catch (error) {
    console.error(
      "EXPORT_SITE_ERROR",
      error
    );

    if (res.headersSent) {
      if (!res.destroyed) {
        res.destroy(
          error instanceof Error
            ? error
            : new Error(
                String(error)
              )
        );
      }

      return;
    }

    return res
      .status(500)
      .json({
        success: false,
        message:
          "Failed to export site",
      });
  }
};
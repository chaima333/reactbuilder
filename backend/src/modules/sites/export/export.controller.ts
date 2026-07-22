import {
  Request,
  Response,
} from "express";

import archiver = require("archiver");
import {
  createHash,
} from "crypto";
import {
  lookup,
} from "dns/promises";
import {
  isIP,
} from "net";
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

type DownloadedMediaAsset = {
  sourceUrl: string;
  archivePath: string;
  publicPath: string;
  contentType: string;
  buffer: Buffer;
};

type MediaBundleResult = {
  assets: DownloadedMediaAsset[];
  urlMap: Map<string, string>;
  failedUrls: string[];
};

type MediaDownloader = (
  url: string
) => Promise<{
  contentType: string;
  buffer: Buffer;
} | null>;

const MEDIA_DOWNLOAD_TIMEOUT_MS =
  8000;

const MEDIA_MAX_BYTES =
  10 * 1024 * 1024;

const ALLOWED_MEDIA_TYPES =
  new Map<string, string>([
    [
      "image/jpeg",
      ".jpg",
    ],
    [
      "image/png",
      ".png",
    ],
    [
      "image/gif",
      ".gif",
    ],
    [
      "image/webp",
      ".webp",
    ],
    [
      "image/avif",
      ".avif",
    ],
    [
      "image/svg+xml",
      ".svg",
    ],
    [
      "image/x-icon",
      ".ico",
    ],
    [
      "image/vnd.microsoft.icon",
      ".ico",
    ],
  ]);

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

export const createStaticExportUrlResolver = (
  siteId: number,
  publishedSlugs: Iterable<string>
) => {
  const sitePrefix =
    `/site/${siteId}`;

  const knownSlugs =
    new Set(
      Array.from(publishedSlugs)
        .map((slug) =>
          normalizeSlug(
            slug,
            ""
          )
        )
        .filter(Boolean)
    );

  return (value: string): string => {
    const raw =
      String(value || "")
        .trim();

    if (!raw) {
      return raw;
    }

    if (
      raw.startsWith("#") ||
      /^https?:\/\//i.test(raw) ||
      /^mailto:/i.test(raw) ||
      /^tel:/i.test(raw) ||
      /^data:/i.test(raw)
    ) {
      return raw;
    }

    let pathname =
      raw;

    let suffix =
      "";

    const suffixMatch =
      pathname.match(/([?#].*)$/);

    if (suffixMatch) {
      suffix =
        suffixMatch[1];

      pathname =
        pathname.slice(
          0,
          suffixMatch.index
        );
    }

    pathname =
      pathname.replace(
        /\/+$/g,
        ""
      );

    if (
      pathname === sitePrefix ||
      pathname === `${sitePrefix}/home`
    ) {
      return `/${suffix}`;
    }

    if (
      pathname.startsWith(
        `${sitePrefix}/`
      )
    ) {
      const slug =
        normalizeSlug(
          pathname.slice(
            sitePrefix.length + 1
          ),
          ""
        );

      return isHomeSlug(slug)
        ? `/${suffix}`
        : `/${slug}/${suffix}`;
    }

    const slug =
      normalizeSlug(
        pathname.replace(
          /^\/+/,
          ""
        ),
        ""
      );

    if (
      slug &&
      knownSlugs.has(slug)
    ) {
      return isHomeSlug(slug)
        ? `/${suffix}`
        : `/${slug}/${suffix}`;
    }

    return raw;
  };
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

const decodeHtmlAttribute = (
  value: string
): string => {
  return value
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, "\"")
    .replace(/&#039;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
};

const isDataImageUrl = (
  value: string
): boolean =>
  /^data:image\//i.test(
    value.trim()
  );

const isHttpMediaCandidate = (
  value: string
): boolean =>
  /^https?:\/\//i.test(
    value.trim()
  );

export const collectMediaUrlsFromHtml = (
  html: string
): string[] => {
  const urls =
    new Set<string>();

  const addUrl = (
    value: string
  ) => {
    const decoded =
      decodeHtmlAttribute(
        value
      )
        .trim();

    if (
      decoded &&
      (
        isHttpMediaCandidate(decoded) ||
        isDataImageUrl(decoded)
      )
    ) {
      urls.add(decoded);
    }
  };

  for (
    const match of html.matchAll(
      /\bsrc=["']([^"']+)["']/gi
    )
  ) {
    addUrl(match[1]);
  }

  for (
    const match of html.matchAll(
      /\bsrcset=["']([^"']+)["']/gi
    )
  ) {
    String(match[1])
      .split(",")
      .map((candidate) =>
        candidate.trim().split(/\s+/)[0]
      )
      .filter(Boolean)
      .forEach(addUrl);
  }

  for (
    const match of html.matchAll(
      /url\(\s*(['"]?)(.*?)\1\s*\)/gi
    )
  ) {
    addUrl(match[2]);
  }

  for (
    const match of html.matchAll(
      /<meta\b[^>]*>/gi
    )
  ) {
    const tag =
      match[0];

    if (
      !/(?:property|name)=["'](?:og:image|twitter:image)["']/i.test(tag)
    ) {
      continue;
    }

    const content =
      tag.match(
        /\bcontent=["']([^"']+)["']/i
      );

    if (content) {
      addUrl(content[1]);
    }
  }

  return Array.from(urls);
};

const isPrivateIp = (
  address: string
): boolean => {
  const version =
    isIP(address);

  if (version === 4) {
    const parts =
      address
        .split(".")
        .map(Number);

    const [
      a,
      b,
    ] = parts;

    return (
      a === 10 ||
      a === 127 ||
      (
        a === 172 &&
        b >= 16 &&
        b <= 31
      ) ||
      (
        a === 192 &&
        b === 168
      ) ||
      (
        a === 169 &&
        b === 254
      ) ||
      a === 0
    );
  }

  if (version === 6) {
    const normalized =
      address.toLowerCase();

    return (
      normalized === "::1" ||
      normalized.startsWith("fc") ||
      normalized.startsWith("fd") ||
      normalized.startsWith("fe80:")
    );
  }

  return true;
};

export const isSafePublicMediaUrl = async (
  value: string
): Promise<boolean> => {
  let parsed: URL;

  try {
    parsed =
      new URL(value);
  } catch {
    return false;
  }

  if (
    parsed.protocol !== "http:" &&
    parsed.protocol !== "https:"
  ) {
    return false;
  }

  const hostname =
    parsed.hostname.toLowerCase();

  if (
    hostname === "localhost" ||
    hostname.endsWith(".localhost")
  ) {
    return false;
  }

  if (
    isIP(hostname) &&
    isPrivateIp(hostname)
  ) {
    return false;
  }

  try {
    const addresses =
      await lookup(
        hostname,
        {
          all: true,
        }
      );

    return addresses.every(
      ({ address }) =>
        !isPrivateIp(address)
    );
  } catch {
    return false;
  }
};

const extensionFromContentType = (
  contentType: string
): string =>
  ALLOWED_MEDIA_TYPES.get(
    contentType
      .split(";")[0]
      .trim()
      .toLowerCase()
  ) || "";

const sanitizeAssetBaseName = (
  value: string
): string => {
  const clean =
    value
      .replace(/\.[a-zA-Z0-9]+$/, "")
      .replace(/[^a-zA-Z0-9-_]+/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 48);

  return clean || "asset";
};

export const createAssetFilename = (
  url: string,
  contentType: string
): string => {
  const hash =
    createHash("sha256")
      .update(url)
      .digest("hex")
      .slice(0, 10);

  let base =
    "asset";

  try {
    const parsed =
      new URL(url);

    const lastSegment =
      parsed.pathname
        .split("/")
        .filter(Boolean)
        .pop() || "asset";

    base =
      sanitizeAssetBaseName(
        lastSegment
      );
  } catch {
    base = "asset";
  }

  const extension =
    extensionFromContentType(
      contentType
    ) || ".bin";

  return `${base}-${hash}${extension}`;
};

export const defaultMediaDownloader: MediaDownloader = async (
  url
) => {
  if (
    !(await isSafePublicMediaUrl(url))
  ) {
    return null;
  }

  const controller =
    new AbortController();

  const timeout =
    setTimeout(
      () => controller.abort(),
      MEDIA_DOWNLOAD_TIMEOUT_MS
    );

  try {
    const response =
      await fetch(
        url,
        {
          signal:
            controller.signal,
          redirect:
            "follow",
        }
      );

    if (!response.ok) {
      return null;
    }

    const contentType =
      response.headers
        .get("content-type")
        ?.split(";")[0]
        .trim()
        .toLowerCase() || "";

    if (
      !ALLOWED_MEDIA_TYPES.has(contentType)
    ) {
      return null;
    }

    const contentLength =
      Number(
        response.headers.get(
          "content-length"
        )
      );

    if (
      Number.isFinite(contentLength) &&
      contentLength > MEDIA_MAX_BYTES
    ) {
      return null;
    }

    const buffer =
      Buffer.from(
        await response.arrayBuffer()
      );

    if (
      buffer.byteLength >
      MEDIA_MAX_BYTES
    ) {
      return null;
    }

    return {
      contentType,
      buffer,
    };
  } catch {
    return null;
  } finally {
    clearTimeout(timeout);
  }
};

export const bundleStaticExportMedia = async (
  htmlPages: Record<string, string>,
  downloader: MediaDownloader = defaultMediaDownloader
): Promise<MediaBundleResult> => {
  const urls =
    new Set<string>();

  for (
    const html of Object.values(
      htmlPages
    )
  ) {
    collectMediaUrlsFromHtml(html)
      .forEach((url) =>
        urls.add(url)
      );
  }

  const assets:
    DownloadedMediaAsset[] = [];

  const urlMap =
    new Map<string, string>();

  const failedUrls:
    string[] = [];

  for (const url of urls) {
    if (isDataImageUrl(url)) {
      continue;
    }

    if (
      !isHttpMediaCandidate(url)
    ) {
      continue;
    }

    const downloaded =
      await downloader(url);

    if (!downloaded) {
      failedUrls.push(url);
      continue;
    }

    const filename =
      createAssetFilename(
        url,
        downloaded.contentType
      );

    const publicPath =
      `/assets/${filename}`;

    urlMap.set(
      url,
      publicPath
    );

    assets.push({
      sourceUrl:
        url,
      archivePath:
        `assets/${filename}`,
      publicPath,
      contentType:
        downloaded.contentType,
      buffer:
        downloaded.buffer,
    });
  }

  return {
    assets,
    urlMap,
    failedUrls,
  };
};

export const rewriteMediaUrlsInHtml = (
  html: string,
  urlMap: Map<string, string>
): string => {
  let rewritten =
    html;

  const entries =
    Array.from(
      urlMap.entries()
    )
      .sort(
        ([a], [b]) =>
          b.length - a.length
      );

  for (
    const [
      remoteUrl,
      localUrl,
    ] of entries
  ) {
    rewritten =
      rewritten
        .split(remoteUrl)
        .join(localUrl)
        .split(
          remoteUrl.replace(/&/g, "&amp;")
        )
        .join(localUrl);
  }

  return rewritten;
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
const sanitizeStaticExportHtml = (
  html: string
): string =>
  html.replace(
    /grid-template-rows:\s*(\d+(?:\.\d+)?)px(\s*!important)?(?=;)/gi,
    (
      original,
      rawValue: string,
      important = ""
    ) => {
      const value =
        Number(rawValue);

      if (
        Number.isFinite(value) &&
        value >= 700
      ) {
        return `grid-template-rows:auto${important}`;
      }

      return original;
    }
  );

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

    const staticExportUrlResolver =
      createStaticExportUrlResolver(
        siteId,
        pages.map((page) =>
          normalizeSlug(
            (page.toJSON() as any).slug,
            `page-${page.id}`
          )
        )
      );

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
          siteId,
          {
            rewriteUrl:
              staticExportUrlResolver,
          }
        );

      const renderedHtml =
  renderFullPage(
    exportPageData,
    seo,
    exportedCanonical,
    blocksHTML
  );

const html =
  sanitizeStaticExportHtml(
    renderedHtml
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

    const mediaBundle =
      await bundleStaticExportMedia(
        htmlPages
      );

    if (mediaBundle.urlMap.size > 0) {
      for (
        const filename of Object.keys(
          htmlPages
        )
      ) {
        htmlPages[filename] =
          rewriteMediaUrlsInHtml(
            htmlPages[filename],
            mediaBundle.urlMap
          );
      }
    }

    const warnings:
      string[] = [];

    if (!baseUrl) {
      warnings.push(
        "No baseUrl was supplied. sitemap.xml was not generated and canonical URLs may remain empty."
      );
    }

    if (
      mediaBundle.failedUrls.length > 0
    ) {
      warnings.push(
        `${mediaBundle.failedUrls.length} media URL(s) could not be localized and remain remote.`
      );
    }

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
          mediaBundle.assets.length > 0,

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
          const asset of mediaBundle.assets
        ) {
          archive.append(
            asset.buffer,
            {
              name:
                asset.archivePath,
            }
          );
        }

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

import fs from "fs";
import path from "path";
import { MediaService } from "../media/media.service";
import {
  makeSafeImportedPageSlug,
  normalizeImportedPageSlug
} from "./importedPageIdentity";
import {
  cleanupImportPath,
  extractValidatedZip,
  isZipImportValidationError,
  validateZipUploadFile
} from "./zipImportSecurity";

const extractTemplateConst = (
  js: string,
  name: string
) => {
  const match = js.match(
    new RegExp(
      `const\\s+${name}\\s*=\\s*\`([\\s\\S]*?)\`;`
    )
  );

  return match?.[1] || "";
};

const isHtmlFile = (
  filePath: string
) =>
  path
    .extname(filePath)
    .toLowerCase() ===
  ".html";

const toSourceFile = (
  extractDir: string,
  filePath: string
) =>
  path
    .relative(
      extractDir,
      filePath
    )
    .replace(
      /\\/g,
      "/"
    );

const makeSlug = (
  filePath: string
) => {
  const extension =
    path.extname(
      filePath
    );

  const fileName =
    path.basename(
      filePath,
      extension
    );

  return normalizeImportedPageSlug(
    fileName.toLowerCase() === "index"
      ? "home"
      : fileName
  );
};

const makeTitle = (
  slug: string
) =>
  slug
    .split("-")
    .map(
      word =>
        word.charAt(0).toUpperCase() +
        word.slice(1)
    )
    .join(" ");

const normalizeHrefPath = (
  href: string
) =>
  stripUrlMeta(href)
    .trim()
    .replace(/\\/g, "/")
    .replace(/^\/+/, "")
    .replace(/^(\.\/)+/, "");

const isExternalUrl = (
  value: string
) =>
  /^(?:[a-z][a-z0-9+.-]*:|\/\/|#)/i.test(
    value.trim()
  );

const stripUrlMeta = (
  value: string
) =>
  value
    .split("#")[0]
    .split("?")[0];

const getMimeType = (
  filePath: string
) => {
  const ext =
    path
      .extname(filePath)
      .toLowerCase();

  const mimeByExt:
    Record<string, string> = {
      ".css": "text/css",
      ".gif": "image/gif",
      ".jpg": "image/jpeg",
      ".jpeg": "image/jpeg",
      ".png": "image/png",
      ".svg": "image/svg+xml",
      ".webp": "image/webp",
      ".avif": "image/avif",
      ".ico": "image/x-icon",
      ".woff": "font/woff",
      ".woff2": "font/woff2",
      ".ttf": "font/ttf",
      ".otf": "font/otf"
    };

  return (
    mimeByExt[ext] ||
    "application/octet-stream"
  );
};

const toDataUrl = (
  filePath: string
) => {
  const buffer =
    fs.readFileSync(filePath);

  return `data:${getMimeType(filePath)};base64,${buffer.toString("base64")}`;
};

const getAttribute = (
  tag: string,
  name: string
) => {
  const match =
    tag.match(
      new RegExp(
        `\\s${name}\\s*=\\s*(?:(["'])(.*?)\\1|([^\\s>]+))`,
        "i"
      )
    );

  return match?.[2] || match?.[3] || "";
};

const hasStylesheetRel = (
  tag: string
) =>
  /\srel\s*=\s*(["'])[^"']*\bstylesheet\b[^"']*\1/i.test(
    tag
  );

const resolveZipAssetPath = (
  extractDir: string,
  fromFile: string,
  assetHref: string,
  fileByRelativePath: Map<string, string>
) => {
  if (
    !assetHref ||
    isExternalUrl(assetHref)
  ) {
    return null;
  }

  const cleanHref =
    stripUrlMeta(assetHref);

  const fromDir =
    path.dirname(fromFile);

  const fromRelativeDir =
    path
      .relative(
        extractDir,
        fromDir
      )
      .replace(/\\/g, "/");

  const direct =
    normalizeHrefPath(cleanHref);

  const relativeToSource =
    normalizeHrefPath(
      path
        .relative(
          extractDir,
          path.resolve(
            fromDir,
            cleanHref
          )
        )
        .replace(/\\/g, "/")
    );

  const relativeToSourceDir =
    fromRelativeDir
      ? normalizeHrefPath(
          `${fromRelativeDir}/${direct}`
        )
      : direct;

  const candidates =
    Array.from(
      new Set(
        [
          direct,
          relativeToSource,
          relativeToSourceDir
        ].filter(Boolean)
      )
    );

  for (const candidate of candidates) {
    const normalized =
      normalizeHrefPath(candidate);

    const exact =
      fileByRelativePath.get(
        normalized
      );

    if (exact) {
      return exact;
    }

    const insensitive =
      fileByRelativePath.get(
        normalized.toLowerCase()
      );

    if (insensitive) {
      return insensitive;
    }
  }

  const lowerCandidates =
    candidates.map(candidate =>
      normalizeHrefPath(candidate).toLowerCase()
    );

  const uniqueEntries =
    Array.from(
      new Map(
        Array.from(fileByRelativePath.entries())
          .map(([key, value]) => [
            normalizeHrefPath(key).toLowerCase(),
            value
          ])
      ).entries()
    );

  for (const candidate of lowerCandidates) {
    const suffix =
      `/${candidate}`;

    const suffixMatch =
      uniqueEntries.find(([key]) =>
        key.endsWith(suffix)
      );

    if (suffixMatch) {
      return suffixMatch[1];
    }
  }

  const basename =
    path
      .basename(direct)
      .toLowerCase();

  if (basename) {
    const basenameMatches =
      uniqueEntries.filter(([key]) =>
        path
          .basename(key)
          .toLowerCase() === basename
      );

    if (basenameMatches.length === 1) {
      return basenameMatches[0][1];
    }
  }

  return null;
};

const rewriteCssUrlsToDataUrls = (
  css: string,
  cssPath: string,
  extractDir: string,
  fileByRelativePath: Map<string, string>
) =>
  css.replace(
    /url\(\s*(["']?)([^"')]+)\1\s*\)/gi,
    (
      match,
      _quote,
      rawUrl
    ) => {
      const assetPath =
        resolveZipAssetPath(
          extractDir,
          cssPath,
          rawUrl,
          fileByRelativePath
        );

      if (!assetPath) {
        return match;
      }

      return `url("${toDataUrl(assetPath)}")`;
    }
  );

const inlineZipStylesheets = (
  html: string,
  htmlPath: string,
  extractDir: string,
  fileByRelativePath: Map<string, string>
) =>
  html.replace(
    /<link\b[^>]*>/gi,
    tag => {
      if (!hasStylesheetRel(tag)) {
        return tag;
      }

      const href =
        getAttribute(
          tag,
          "href"
        );

      const cssPath =
        resolveZipAssetPath(
          extractDir,
          htmlPath,
          href,
          fileByRelativePath
        );

      if (!cssPath) {
        return tag;
      }

      const css =
        fs.readFileSync(
          cssPath,
          "utf-8"
        );

      const inlinedCss =
        rewriteCssUrlsToDataUrls(
          css,
          cssPath,
          extractDir,
          fileByRelativePath
        );

      return `<style data-inlined-from="${normalizeHrefPath(href)}">\n${inlinedCss.replace(
        /<\/style/gi,
        "<\\/style"
      )}\n</style>`;
    }
  );

const rewriteImgSrcToDataUrls = (
  html: string,
  htmlPath: string,
  extractDir: string,
  fileByRelativePath: Map<string, string>
) =>
  html.replace(
    /<img\b[^>]*>/gi,
    tag => {
      const src =
        getAttribute(
          tag,
          "src"
        );

      const imagePath =
        resolveZipAssetPath(
          extractDir,
          htmlPath,
          src,
          fileByRelativePath
        );

      if (!imagePath) {
        return tag;
      }

      return tag.replace(
        /(\ssrc\s*=\s*)(["'])(.*?)\2/i,
        `$1$2${toDataUrl(imagePath)}$2`
      );
    }
  );

const createSelfContainedHtml = (
  html: string,
  htmlPath: string,
  extractDir: string,
  fileByRelativePath: Map<string, string>
) => {
  const withStyles =
    inlineZipStylesheets(
      html,
      htmlPath,
      extractDir,
      fileByRelativePath
    );

  return rewriteImgSrcToDataUrls(
    withStyles,
    htmlPath,
    extractDir,
    fileByRelativePath
  );
};

export const importHtmlZip = async (
  req: any,
  res: any
) => {
  let zipPath: string | undefined;
  let extractDir: string | undefined;
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        code: "HTML_ZIP_UPLOAD_INVALID",
        message: "No file uploaded"
      });
    }

    zipPath = req.file.path;

    validateZipUploadFile(req.file);

    const extractedZip =
      await extractValidatedZip(zipPath);

    extractDir =
      extractedZip.extractDir;

    const files =
      extractedZip.files;

    const fileByRelativePath =
      new Map<string, string>();

    for (const file of files) {
      const relativePath =
        path
          .relative(extractDir, file)
          .replace(/\\/g, "/");

      const normalized =
        normalizeHrefPath(relativePath);

      fileByRelativePath.set(normalized, file);
      fileByRelativePath.set(normalized.toLowerCase(), file);
    }

    const htmlFiles =
      files
        .filter(isHtmlFile)
        .sort(
          (left, right) =>
            toSourceFile(extractDir, left).localeCompare(
              toSourceFile(extractDir, right)
            )
        );

    const sourceHtmlFiles =
      htmlFiles.map(
        htmlPath =>
          toSourceFile(extractDir, htmlPath)
      );

    console.log(
      "ZIP_SOURCE_HTML_MANIFEST",
      {
        count: sourceHtmlFiles.length,
        files: sourceHtmlFiles
      }
    );

    if (sourceHtmlFiles.length === 0) {
      return res
        .status(422)
        .json({
          success: false,
          code: "ZIP_NO_HTML_FILES",
          message: "The ZIP does not contain any HTML files",
          sourceHtmlFiles: []
        });
    }

    const siteJsPath =
      files.find(
        file =>
          toSourceFile(extractDir, file).toLowerCase() ===
          "assets/site.js"
      );

    let navHtml = "";
    let footerHtml = "";

    if (siteJsPath) {
      const siteJs =
        fs.readFileSync(siteJsPath, "utf-8");

      navHtml = extractTemplateConst(siteJs, "NAV_HTML");
      footerHtml = extractTemplateConst(siteJs, "FOOTER_HTML");
    }

    const imageFiles =
      files.filter(file =>
        /\.(png|jpg|jpeg|webp|gif|svg)$/i.test(file)
      );

    const assetMap: Record<string, string> = {};

    for (const imagePath of imageFiles) {
      const buffer = fs.readFileSync(imagePath);

      const relativePath =
        path
          .relative(extractDir, imagePath)
          .replace(/\\/g, "/");

      const fakeFile = {
        buffer,
        originalname: path.basename(imagePath),
        mimetype: "image/" + path.extname(imagePath).replace(".", ""),
        size: buffer.length
      };

      const media =
        await MediaService.processUpload(
          fakeFile,
          String(req.params.siteId),
          String(req.user.id)
        );

      assetMap[relativePath] = media.url;
    }

    const usedPageSlugs = new Set<string>();
    const pages: any[] = [];
    const pagePreparationFailures: Array<{
      sourceFile: string;
      message: string;
    }> = [];

    for (const htmlPath of htmlFiles) {
      const sourceFile = toSourceFile(extractDir, htmlPath);
      const rawSlug = makeSlug(htmlPath);
      const slug = makeSafeImportedPageSlug(rawSlug, usedPageSlugs);
      const title = makeTitle(rawSlug);

      console.log("ZIP_BACKEND_PAGE_PREPARE_START", {
        sourceFile,
        rawSlug,
        resolvedSlug: slug,
        title
      });

      try {
        let processedHtml = fs.readFileSync(htmlPath, "utf-8");

        processedHtml = createSelfContainedHtml(
          processedHtml,
          htmlPath,
          extractDir,
          fileByRelativePath
        );

        processedHtml = processedHtml.replace(
          /<div[^>]*id=["']site-nav["'][^>]*>\s*<\/div>/i,
          ""
        );

        processedHtml = processedHtml.replace(
          /<div[^>]*id=["']site-footer["'][^>]*>\s*<\/div>/i,
          ""
        );

        for (const [localPath, cloudUrl] of Object.entries(assetMap)) {
          processedHtml = processedHtml.split(localPath).join(cloudUrl);
        }

        pages.push({
          title,
          originalSlug: rawSlug,
          slug,
          sourceFile,
          processedHtml,
          isHomepage:
            path.basename(htmlPath).toLowerCase() === "index.html"
        });

        console.log("ZIP_BACKEND_PAGE_PREPARE_SUCCESS", {
          sourceFile,
          slug,
          htmlLength: processedHtml.length
        });
      } catch (error: unknown) {
        const message =
          error instanceof Error ? error.message : String(error);

        console.error("ZIP_BACKEND_PAGE_PREPARE_FAILED", {
          sourceFile,
          slug,
          message
        });

        pagePreparationFailures.push({
          sourceFile,
          message
        });
      }
    }

    if (pagePreparationFailures.length > 0) {
      return res.status(422).json({
        success: false,
        code: "ZIP_PAGE_PREPARATION_FAILED",
        message: `Failed to prepare ${pagePreparationFailures.length} HTML page(s)`,
        sourceHtmlFiles,
        preparedPages: pages.map(page => ({
          sourceFile: page.sourceFile,
          slug: page.slug
        })),
        failedPages: pagePreparationFailures
      });
    }

    const pageByHref = new Map<string, string>();

    for (const page of pages) {
      const source = normalizeHrefPath(page.sourceFile);
      const basename = path.basename(source);

      const route =
        page.slug === "home"
          ? `/site/${req.params.siteId}`
          : `/site/${req.params.siteId}/${page.slug}`;

      pageByHref.set(source, route);
      pageByHref.set(basename, route);
      pageByHref.set(`./${basename}`, route);
    }

    const rewriteAssetUrls = (html: string) => {
      let output = html;

      for (const [localPath, cloudUrl] of Object.entries(assetMap)) {
        output = output.split(localPath).join(cloudUrl);
      }

      return output;
    };

    const rewriteInternalLinks = (html: string) =>
      html.replace(
        /href=(["'])([^"']+\.html(?:[?#][^"']*)?)\1/gi,
        (_match, quote, href) => {
          const split = String(href).match(/^([^?#]+)([?#].*)?$/);
          const hrefPath = normalizeHrefPath(split?.[1] || "");
          const suffix = split?.[2] || "";

          const route = pageByHref.get(hrefPath);

          if (!route) {
            return `href=${quote}${href}${quote}`;
          }

          return `href=${quote}${route}${suffix}${quote}`;
        }
      );

    navHtml = rewriteInternalLinks(rewriteAssetUrls(navHtml));
    footerHtml = rewriteInternalLinks(rewriteAssetUrls(footerHtml));

    // تحديث الـresponse النهائي
    return res.json({
      success: true,
      assetMap,
      globalLayout: {
        navHtml,
        footerHtml
      },
      sourceHtmlFiles,
      manifest: {
        expectedPageCount: sourceHtmlFiles.length,
        preparedPageCount: pages.length,
        sourceHtmlFiles,
        preparedPages: pages.map(page => ({
          sourceFile: page.sourceFile,
          title: page.title,
          slug: page.slug
        }))
      },
      pages
    });
  } catch (error: any) {
    console.error("IMPORT_ZIP_ERROR", error);

    if (isZipImportValidationError(error)) {
      return res.status(error.statusCode).json({
        success: false,
        code: error.code,
        message: error.message
      });
    }

    return res.status(500).json({
      success: false,
      code: "ZIP_IMPORT_FAILED",
      message: "ZIP import failed."
    });
  } finally {
    cleanupImportPath(zipPath);
    cleanupImportPath(extractDir);
  }
};

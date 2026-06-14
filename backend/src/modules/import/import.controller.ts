import fs from "fs";
import path from "path";
import unzipper from "unzipper";
import { MediaService } from "../media/media.service";

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

const makeSlug = (
  filePath: string
) => {
  const name =
    path.basename(
      filePath,
      ".html"
    );

  return name === "index"
    ? "home"
    : name;
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
  href
    .replace(/\\/g, "/")
    .replace(/^\.\//, "")
    .replace(/^\//, "");

export const importHtmlZip = async (
  req: any,
  res: any
) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No file uploaded"
      });
    }

    const zipPath =
      req.file.path;

    const extractDir =
      path.join(
        "temp",
        `${req.file.filename}_extract`
      );

    fs.mkdirSync(
      extractDir,
      { recursive: true }
    );

    await fs
      .createReadStream(zipPath)
      .pipe(
        unzipper.Extract({
          path: extractDir
        })
      )
      .promise();

    const files: string[] = [];

    const walk = (dir: string) => {
      for (const entry of fs.readdirSync(dir)) {
        const fullPath =
          path.join(dir, entry);

        const stat =
          fs.statSync(fullPath);

        if (stat.isDirectory()) {
          walk(fullPath);
        } else {
          files.push(fullPath);
        }
      }
    };

    walk(extractDir);

    const htmlFiles =
      files.filter(file =>
        file.endsWith(".html")
      );

    const siteJsPath =
      files.find(file =>
        file.endsWith("assets/site.js")
      );

    let navHtml = "";
    let footerHtml = "";

    if (siteJsPath) {
      const siteJs =
        fs.readFileSync(
          siteJsPath,
          "utf-8"
        );

      navHtml =
        extractTemplateConst(
          siteJs,
          "NAV_HTML"
        );

      footerHtml =
        extractTemplateConst(
          siteJs,
          "FOOTER_HTML"
        );
    }

    const imageFiles =
      files.filter(file =>
        /\.(png|jpg|jpeg|webp|gif|svg)$/i.test(file)
      );

    const assetMap: Record<string, string> = {};

    for (const imagePath of imageFiles) {
      const buffer =
        fs.readFileSync(imagePath);

      const relativePath =
        path
          .relative(extractDir, imagePath)
          .replace(/\\/g, "/");

      const fakeFile = {
        buffer,
        originalname:
          path.basename(imagePath),
        mimetype:
          "image/" +
          path.extname(imagePath).replace(".", ""),
        size:
          buffer.length
      };

      const media =
        await MediaService.processUpload(
          fakeFile,
          String(req.params.siteId),
          String(req.user.id)
        );

      assetMap[relativePath] =
        media.url;
    }

    const pages =
      htmlFiles.map(htmlPath => {
        const slug =
          makeSlug(htmlPath);

        const title =
          makeTitle(slug);

        let processedHtml =
          fs.readFileSync(
            htmlPath,
            "utf-8"
          );

        processedHtml =
          processedHtml.replace(
            /<div[^>]*id=["']site-nav["'][^>]*>\s*<\/div>/i,
            ""
          );

        processedHtml =
          processedHtml.replace(
            /<div[^>]*id=["']site-footer["'][^>]*>\s*<\/div>/i,
            ""
          );

        for (const [localPath, cloudUrl] of Object.entries(assetMap)) {
          processedHtml =
            processedHtml
              .split(localPath)
              .join(cloudUrl);
        }

        const sourceFile =
          path.relative(
            extractDir,
            htmlPath
          ).replace(/\\/g, "/");

        return {
          title,
          slug,
          sourceFile,
          processedHtml,
          isHomepage:
            path.basename(htmlPath).toLowerCase() === "index.html"
        };
      });

    const pageByHref =
      new Map<string, string>();

    for (const page of pages) {
      const source =
        normalizeHrefPath(
          page.sourceFile
        );

      const basename =
        path.basename(
          source
        );

      const route =
        page.slug === "home"
          ? `/site/${req.params.siteId}`
          : `/site/${req.params.siteId}/${page.slug}`;

      pageByHref.set(source, route);
      pageByHref.set(basename, route);
      pageByHref.set(`./${basename}`, route);
    }

    const rewriteInternalLinks = (
      html: string
    ) =>
      html.replace(
        /href=(["'])([^"']+\.html(?:[?#][^"']*)?)\1/gi,
        (
          _match,
          quote,
          href
        ) => {
          const split =
            String(href).match(
              /^([^?#]+)([?#].*)?$/
            );

          const hrefPath =
            normalizeHrefPath(
              split?.[1] || ""
            );

          const suffix =
            split?.[2] || "";

          const route =
            pageByHref.get(
              hrefPath
            );

          if (!route) {
            return `href=${quote}${href}${quote}`;
          }

          return `href=${quote}${route}${suffix}${quote}`;
        }
      );

    navHtml =
      rewriteInternalLinks(
        navHtml
      );

    footerHtml =
      rewriteInternalLinks(
        footerHtml
      );

    return res.json({
      success: true,
      assetMap,
      globalLayout: {
        navHtml,
        footerHtml
      },
      pages
    });

  } catch (error: any) {
    console.error(
      "IMPORT_ZIP_ERROR",
      error
    );

    return res.status(500).json({
      success: false,
      message: error.message,
      stack: error.stack
    });
  }
};

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

export const importHtmlZip = async (
  req: any,
  res: any
) => {
  try {
    console.log("🚀 ZIP IMPORT MULTI PAGE LOADED");

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

        if (navHtml) {
          processedHtml =
            processedHtml.replace(
              /<div[^>]*id=["']site-nav["'][^>]*>\s*<\/div>/i,
              navHtml
            );
        }

        if (footerHtml) {
          processedHtml =
            processedHtml.replace(
              /<div[^>]*id=["']site-footer["'][^>]*>\s*<\/div>/i,
              footerHtml
            );
        }

        for (const [localPath, cloudUrl] of Object.entries(assetMap)) {
          processedHtml =
            processedHtml
              .split(localPath)
              .join(cloudUrl);
        }

        return {
          title,
          slug,
          sourceFile:
            path.relative(
              extractDir,
              htmlPath
            ),
          processedHtml
        };
      });

    return res.json({
      success: true,
      assetMap,
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
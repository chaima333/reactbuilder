import fs from "fs";
import path from "path";
import unzipper from "unzipper";
import { MediaService } from "../media/media.service";

export const importHtmlZip = async (
  req: any,
  res: any
) => {
  try {
console.log("🚀 ZIP IMPORT V2 LOADED");
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No file uploaded"
      });
    }

    console.log(
      "IMPORT ZIP FILE",
      req.file
    );

    const zipPath =
      req.file.path;

    const extractDir =
      path.join(
        "temp",
        `${req.file.filename}_extract`
      );

    // =========================
    // CREATE EXTRACTION FOLDER
    // =========================

    fs.mkdirSync(
      extractDir,
      {
        recursive: true
      }
    );

    // =========================
    // EXTRACT ZIP
    // =========================

    await fs
      .createReadStream(zipPath)
      .pipe(
        unzipper.Extract({
          path: extractDir
        })
      )
      .promise();

    // =========================
    // SCAN FILES
    // =========================

    const files: string[] = [];

    const walk = (
      dir: string
    ) => {

      const entries =
        fs.readdirSync(dir);

      for (const entry of entries) {

        const fullPath =
          path.join(
            dir,
            entry
          );

        const stat =
          fs.statSync(
            fullPath
          );

        if (
          stat.isDirectory()
        ) {

          walk(fullPath);

        } else {

          files.push(
            fullPath
          );
        }
      }
    };

    walk(extractDir);

    // =========================
    // FIND HTML FILES
    // =========================

    const htmlFiles =
      files.filter(
        file =>
          file.endsWith(".html")
      );

    // =========================
    // FIND INDEX.HTML
    // =========================

    const indexHtmlPath =
      htmlFiles.find(
        file =>
          path.basename(file) ===
          "index.html"
      );

    const indexHtml =
      indexHtmlPath
        ? fs.readFileSync(
            indexHtmlPath,
            "utf-8"
          )
        : null;

    console.log(
      "HTML FILES",
      htmlFiles
    );

    console.log(
      "INDEX HTML PATH",
      indexHtmlPath
    );

    console.log(
      "INDEX HTML FOUND",
      !!indexHtml
    );
    let processedHtml =
  indexHtml || "";

  const siteJsPath =
  files.find(file =>
    file.endsWith("assets/site.js")
  );

if (siteJsPath) {
  const siteJs =
    fs.readFileSync(siteJsPath, "utf-8");
    const extractTemplateConst = (
  js: string,
  name: string
) => {
  const match = js.match(
    new RegExp(`const\\s+${name}\\s*=\\s*\`([\\s\\S]*?)\`;`)
  );

  return match?.[1] || "";
};

  const navHtml =
    extractTemplateConst(siteJs, "NAV_HTML");

  const footerHtml =
    extractTemplateConst(siteJs, "FOOTER_HTML");
console.log("ZIP TEMPLATE INJECTION", {
  siteJsFound: !!siteJsPath,
  navFound: !!navHtml,
  footerFound: !!footerHtml,
  beforeHasNavHost: processedHtml.includes('<div id="site-nav"></div>'),
  beforeHasFooterHost: processedHtml.includes('<div id="site-footer"></div>')
});
console.log("ZIP HTML AFTER INJECTION", {
  hasNavTag: processedHtml.includes('<nav'),
  hasFooterTag: processedHtml.includes('<footer'),
  hasLogoPath: processedHtml.includes('assets/logo.png')
});
  if (navHtml) {
    processedHtml =
      processedHtml.replace(
        '<div id="site-nav"></div>',
        navHtml
      );
  }

  if (footerHtml) {
    processedHtml =
      processedHtml.replace(
        '<div id="site-footer"></div>',
        footerHtml
      );
  }
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
      "image/" + path.extname(imagePath).replace(".", ""),
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

  processedHtml =
    processedHtml
      .split(relativePath)
      .join(media.url);
}


    // =========================
    // RESPONSE
    // =========================
    return res.json({
  success: true,

  assetMap,

  processedHtml
});

  } catch (error: any) {

    console.error(
      "IMPORT_ZIP_ERROR",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        error.message,
      stack:
        error.stack
    });
  }
};
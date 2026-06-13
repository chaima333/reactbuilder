import fs from "fs";
import path from "path";
import unzipper from "unzipper";

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

    // =========================
    // RESPONSE
    // =========================

    return res.json({
      success: true,

      file: req.file,

      extractDir,

      htmlFiles,

      indexHtmlPath,

      indexHtmlFound:
        !!indexHtml,

      files
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
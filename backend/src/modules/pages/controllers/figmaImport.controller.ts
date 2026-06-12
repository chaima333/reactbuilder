import { Request, Response } from "express";
import { fetchFigmaFile } from "../services/figma/figmaApiClient";

export const importFigma = async (
  req: Request,
  res: Response
) => {
  try {
    const { fileKey, frameId } = req.body;

    const token = process.env.FIGMA_ACCESS_TOKEN;

    if (!token) {
      return res.status(500).json({
        success: false,
        message: "FIGMA_ACCESS_TOKEN is missing"
      });
    }

  console.log("FIGMA IMPORT REQUEST", {
  fileKey,
  frameId
});

const figmaDoc =
  await fetchFigmaFile(
    fileKey,
    token
  );

return res.status(200).json({
  success: true,
  message: "Figma fetched",
  data: {
  name: figmaDoc.name,
  document: figmaDoc.document
}
});
    } catch (error: any) {
    console.error(
      "[FIGMA_IMPORT_ERROR_FULL]",
      error
    );

    return res.status(500).json({
      success: false,
      message: error?.message || "Figma import failed"
    });
  }
};
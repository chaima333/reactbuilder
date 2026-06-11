import { Request, Response } from "express";

export const importFigma = async (
  req: Request,
  res: Response
) => {
  try {
    const { fileKey, frameId } = req.body;

    console.log("FIGMA IMPORT REQUEST", {
      fileKey,
      frameId
    });

    return res.status(200).json({
      success: true,
      message: "Figma import request received",
      data: {
        fileKey,
        frameId
      }
    });
  } catch (error: any) {
    console.error(
      "[FIGMA_IMPORT_ERROR]:",
      error.message
    );

    return res.status(500).json({
      success: false,
      message: "Figma import failed"
    });
  }
};
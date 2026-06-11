import { Request, Response } from "express";

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

    return res.status(200).json({
      success: true,
      message: "Token exists and request received",
      data: {
        fileKey,
        frameId
      }
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
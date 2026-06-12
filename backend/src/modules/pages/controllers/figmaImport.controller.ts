import { Request, Response } from "express";
import { fetchFigmaFile } from "../services/figma/figmaApiClient";
import { mockFigmaDocument } from "../services/figma/mockFigmaDocument";

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

    if (process.env.FIGMA_MOCK_MODE === "true") {
      return res.status(200).json({
        success: true,
        message: "Figma mock fetched",
        data: {
          name: "Mock Figma Document",
          document: mockFigmaDocument
        }
      });
    }

    const token = process.env.FIGMA_ACCESS_TOKEN;

    if (!token) {
      return res.status(500).json({
        success: false,
        message: "FIGMA_ACCESS_TOKEN is missing"
      });
    }

    const figmaDoc = await fetchFigmaFile(
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
      message:
        error?.message ||
        "Figma import failed"
    });
  }
};
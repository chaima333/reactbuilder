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
// This function is meant to be used inside the Figma plugin code
export const importFigmaRaw = async (
  req: Request,
  res: Response
) => {
  try {
    const { payload, source } = req.body;

    if (!payload) {
      return res.status(400).json({
        success: false,
        message: "Missing Figma payload"
      });
    }

    console.log("[FIGMA_RAW_IMPORT]", {
      source,
      frameId: payload.id,
      frameName: payload.name,
      frameType: payload.type,
      childrenCount: Array.isArray(payload.children)
        ? payload.children.length
        : 0
    });

    return res.status(200).json({
      success: true,
      message: "Figma raw payload received",
      data: {
        source: source || "figma-plugin",
        payload
      }
    });
  } catch (error: any) {
    console.error("[FIGMA_RAW_IMPORT_ERROR]", error);

    return res.status(500).json({
      success: false,
      message:
        error?.message ||
        "Figma raw import failed"
    });
  }
};
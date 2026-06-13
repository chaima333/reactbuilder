// backend/src/modules/pages/controllers/figmaImport.controller.ts

import { Request, Response } from "express";
import { fetchFigmaFile } from "../services/figma/figmaApiClient";
import {
  saveFigmaImportPayload,
  getFigmaImportPayload
} from "../services/figma/figmaImportStore";

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
    console.error("[FIGMA_IMPORT_ERROR_FULL]", error);

    return res.status(500).json({
      success: false,
      message:
        error?.message ||
        "Figma import failed"
    });
  }
};

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

    const importId =
      saveFigmaImportPayload(
        payload,
        source || "figma-plugin"
      );

    console.log("[FIGMA_RAW_IMPORT_SAVED]", {
      importId,
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
      message: "Figma payload saved",
      data: {
        importId,
        frameName: payload.name
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

export const getFigmaRawImport = async (
  req: Request,
  res: Response
) => {
  try {
    const { importId } = req.params;

    const item =
      getFigmaImportPayload(importId);

    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Figma import not found"
      });
    }

    return res.status(200).json({
      success: true,
      message: "Figma import found",
      data: item
    });
  } catch (error: any) {
    console.error("[FIGMA_RAW_GET_ERROR]", error);

    return res.status(500).json({
      success: false,
      message:
        error?.message ||
        "Failed to get Figma import"
    });
  }
};
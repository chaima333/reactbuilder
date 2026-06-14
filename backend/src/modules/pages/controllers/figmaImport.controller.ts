// backend/src/modules/pages/controllers/figmaImport.controller.ts

import { Request, Response } from "express";
import { fetchFigmaFile } from "../services/figma/figmaApiClient";
import {
  saveFigmaImportPayload,
  getFigmaImportPayload
} from "../services/figma/figmaImportStore";
import { MediaService } from "../../media/media.service";

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
const processFigmaImages = async (
  node: any,
  siteId: number,
  userId: number
) => {
  if (!node) return;

  if (node.imageBase64 && node.imageMimeType) {
    const buffer = Buffer.from(
      node.imageBase64,
      "base64"
    );

    const ext =
      node.imageMimeType.split("/")[1] || "png";

    const fakeFile = {
      buffer,
      originalname: `${node.name || node.id}.${ext}`,
      mimetype: node.imageMimeType,
      size: buffer.length
    };

    const media =
      await MediaService.processUpload(
        fakeFile,
        String(siteId),
        String(userId)
      );

    node.imageUrl = media.url;

    delete node.imageBase64;
    delete node.imageMimeType;
  }

  if (Array.isArray(node.children)) {
    for (const child of node.children) {
      await processFigmaImages(
        child,
        siteId,
        userId
      );
    }
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

    const siteId = Number(req.params.siteId);
    const authUser = (req as any).user;

    const userId =
      authUser?.userId ||
      authUser?.id ||
      authUser?.sub;

    console.log("[FIGMA_AUTH_USER]", authUser);

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authenticated user not found"
      });
    }
await processFigmaImages(
  payload,
  siteId,
  userId
);
    const importId =
      await saveFigmaImportPayload(
        payload,
        source || "figma-plugin",
        siteId,
        userId
      );

    console.log("[FIGMA_RAW_IMPORT_SAVED]", {
      importId,
      source,
      siteId,
      userId,
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
      await getFigmaImportPayload(importId);

    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Figma import not found"
      });
    }

    return res.status(200).json({
      success: true,
      message: "Figma import found",
      data: {
        id: item.id,
        payload: item.payload,
        source: item.source,
        siteId: item.siteId,
        userId: item.userId,
        createdAt: item.createdAt
      }
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
import crypto from "crypto";
import { Request, Response } from "express";
import { FigmaPluginToken } from "../../models/FigmaPluginToken";
import { SiteMember } from "../../models/SiteMember";
import { Site } from "../../models/site";
import { saveFigmaImportPayload } from "../pages/services/figma/figmaImportStore";
import { MediaService } from "../media/media.service";

const makePluginToken = () =>
  "rb_figma_" + crypto.randomBytes(24).toString("hex");

const processFigmaImages = async (
  node: any,
  siteId: number,
  userId: number
) => {
  if (!node) return;

  if (node.imageBase64 && node.imageMimeType) {
    const buffer = Buffer.from(node.imageBase64, "base64");

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
      await processFigmaImages(child, siteId, userId);
    }
  }
};

const getPluginUser = async (token?: string) => {
  if (!token) return null;

  const item = await FigmaPluginToken.findOne({
    where: {
      token,
      isActive: true
    }
  });

  return item;
};

export const generateFigmaPluginToken = async (
  req: Request,
  res: Response
) => {
  try {
    const authUser = (req as any).user;

    const userId =
      authUser?.id ||
      authUser?.userId ||
      authUser?.sub;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authenticated user not found"
      });
    }

    await FigmaPluginToken.update(
      { isActive: false },
      { where: { userId } }
    );

    const token = makePluginToken();

    await FigmaPluginToken.create({
      token,
      userId,
      isActive: true
    });

    return res.json({
      success: true,
      message: "Figma plugin token generated",
      data: {
        token
      }
    });
  } catch (error: any) {
    console.error("[FIGMA_PLUGIN_TOKEN_ERROR]", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Failed to generate token"
    });
  }
};

export const getFigmaPluginSites = async (
  req: Request,
  res: Response
) => {
  try {
    const token =
      req.headers.authorization?.replace("Bearer ", "");

    const pluginToken =
      await getPluginUser(token);

    if (!pluginToken) {
      return res.status(401).json({
        success: false,
        message: "Invalid plugin token"
      });
    }

    const memberships =
      await SiteMember.findAll({
        where: {
          userId: pluginToken.userId
        },
        include: [Site]
      });

    const sites =
      memberships.map((m: any) => ({
        id: m.site?.id,
        name: m.site?.name,
        subdomain: m.site?.subdomain,
        role: m.role
      })).filter((s: any) => s.id);

    return res.json({
      success: true,
      data: sites
    });
  } catch (error: any) {
    console.error("[FIGMA_PLUGIN_SITES_ERROR]", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Failed to get sites"
    });
  }
};

export const importFigmaRawFromPlugin = async (
  req: Request,
  res: Response
) => {
  try {
    const token =
      req.headers.authorization?.replace("Bearer ", "");

    const pluginToken =
      await getPluginUser(token);

    if (!pluginToken) {
      return res.status(401).json({
        success: false,
        message: "Invalid plugin token"
      });
    }

    const {
      siteId,
      payload,
      source
    } = req.body;

    if (!siteId || !payload) {
      return res.status(400).json({
        success: false,
        message: "Missing siteId or payload"
      });
    }

    const membership =
      await SiteMember.findOne({
        where: {
          siteId: Number(siteId),
          userId: pluginToken.userId
        }
      });

    if (!membership) {
      return res.status(403).json({
        success: false,
        message: "You do not have access to this site"
      });
    }

    await processFigmaImages(
      payload,
      Number(siteId),
      pluginToken.userId
    );

    const importId =
      await saveFigmaImportPayload(
        payload,
        source || "figma-plugin",
        Number(siteId),
        pluginToken.userId
      );

    return res.json({
      success: true,
      message: "Figma payload saved",
      data: {
        importId,
        siteId: Number(siteId),
        frameName: payload.name
      }
    });
  } catch (error: any) {
    console.error("[FIGMA_PLUGIN_IMPORT_ERROR]", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Figma plugin import failed"
    });
  }
};
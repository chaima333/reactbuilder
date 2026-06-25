import { Request, Response } from "express";
import { PluginMarketplaceService } from "./plugin.marketplace.service";

const getSiteId = (req: Request) => {
  const siteId =
    Number(req.params.siteId) ||
    Number(req.query.siteId) ||
    Number((req as any).siteContext?.siteId);

  if (!siteId || Number.isNaN(siteId)) {
    throw new Error("SiteId required");
  }

  return siteId;
};

export const getMarketplace = async (
  req: Request,
  res: Response
) => {
  try {
    const siteId = getSiteId(req);

    const plugins =
      await PluginMarketplaceService.getMarketplace(siteId);

    res.json({
      success: true,
      data: plugins,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const installPlugin = async (
  req: Request,
  res: Response
) => {
  try {
    const siteId = getSiteId(req);
    const pluginId = Number(req.params.pluginId);

    const result =
      await PluginMarketplaceService.installPlugin(
        siteId,
        pluginId
      );

    res.json({
      success: true,
      message: "Plugin installed",
      data: result,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const enablePlugin = async (
  req: Request,
  res: Response
) => {
  try {
    const siteId = getSiteId(req);
    const pluginId = Number(req.params.pluginId);

    const result =
      await PluginMarketplaceService.enablePlugin(
        siteId,
        pluginId
      );

    res.json({
      success: true,
      message: "Plugin enabled",
      data: result,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const disablePlugin = async (
  req: Request,
  res: Response
) => {
  try {
    const siteId = getSiteId(req);
    const pluginId = Number(req.params.pluginId);

    const result =
      await PluginMarketplaceService.disablePlugin(
        siteId,
        pluginId
      );

    res.json({
      success: true,
      message: "Plugin disabled",
      data: result,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const uninstallPlugin = async (
  req: Request,
  res: Response
) => {
  try {
    const siteId = getSiteId(req);
    const pluginId = Number(req.params.pluginId);

    await PluginMarketplaceService.uninstallPlugin(
      siteId,
      pluginId
    );

    res.json({
      success: true,
      message: "Plugin uninstalled",
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};
import { NextFunction, Request, Response } from "express";
import { AdminSettingsService } from "../admin/adminSettings.service";

export const requireFigmaPluginEnabled = async (
  _req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const settings = await AdminSettingsService.getSettings();

    if (settings.figmaPlugin === false) {
      return res.status(403).json({
        success: false,
        message: "FIGMA_PLUGIN_DISABLED"
      });
    }

    return next();
  } catch (error) {
    return next(error);
  }
};

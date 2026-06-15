import { Request, Response } from "express";
import { PlatformSettingsService } from "./platformSettings.service";

export const getPlatformSettings = async (
  _req: Request,
  res: Response
) => {
  const settings =
    await PlatformSettingsService.getPublicSettings();

  return res.json({
    success: true,
    data: settings,
  });
};

import { Request, Response } from "express";
import { AdminSettingsService } from "./adminSettings.service";

export const getAdminSettings = async (
  req: Request,
  res: Response
) => {
  const settings =
    await AdminSettingsService.getSettings();

  return res.json({
    success: true,
    data: settings,
  });
};

export const updateAdminSettings = async (
  req: Request,
  res: Response
) => {
  const settings =
    await AdminSettingsService.saveSettings(
      req.body
    );

  return res.json({
    success: true,
    data: settings,
  });
};
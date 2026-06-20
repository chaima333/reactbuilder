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

export const testAdminWebhook = async (
  req: Request,
  res: Response
) => {
  try {
    const { webhookUrl } = req.body;

    const result =
      await AdminSettingsService.testWebhook(webhookUrl);

    return res.json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};
export const generateAdminApiKey = async (
  req: Request,
  res: Response
) => {
  try {
    const result = await AdminSettingsService.generateApiKey();

    return res.json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
import { Request, Response } from "express";
import { AdminSettingsService } from "./adminSettings.service";
import {
  AdminAiSettingsService,
  PlatformAiSettingsError
} from "./adminAiSettings.service";

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

export const getAdminAiSettings = async (
  req: Request,
  res: Response
) => {
  const settings =
    await AdminAiSettingsService.getSettings();

  return res.json({
    success: true,
    data: settings,
  });
};

export const updateAdminAiSettings = async (
  req: Request,
  res: Response
) => {
  try {
    const settings =
      await AdminAiSettingsService.saveSettings(
        req.body,
        (req as any).user?.id || null
      );

    return res.json({
      success: true,
      data: settings,
    });
  } catch (error: any) {
    const status =
      error instanceof PlatformAiSettingsError
        ? error.status
        : 500;

    return res.status(status).json({
      success: false,
      message:
        error?.message ||
        "Failed to save AI settings",
    });
  }
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

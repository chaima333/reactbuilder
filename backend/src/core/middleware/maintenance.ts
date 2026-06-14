import { Request, Response, NextFunction } from "express";
import { AdminSettingsService } from "../../modules/admin/adminSettings.service";

export const maintenanceMode = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  const settings =
    await AdminSettingsService.getSettings();

  if (!settings.maintenanceMode) {
    return next();
  }

  if (req.user?.role === "ADMIN") {
    return next();
  }

  return res.status(503).json({
    success: false,
    message: "Platform under maintenance"
  });
};
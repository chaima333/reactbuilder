// modules/dashboard/dashboard.controller.ts

import { Response } from "express";
import { AuthRequest } from "../../shared/auth.util";
import * as DashboardService from "./dashboard.service";
import { User } from "../../models/User";

// modules/dashboard/dashboard.controller.ts

export const getDashboardFull = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    // 1. استخراج الـ siteId من المسار (بما أن الرابط /api/sites/:siteId/dashboard)
    const { siteId } = req.params; 

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (!siteId) {
      return res.status(400).json({ message: "Site ID is required" });
    }

    const [
      stats,
      activity,
      pluginsData,
      layout,
      system,
      pluginStatus,
      liveEvents
    ] = await Promise.all([
      // 2. مرر الـ siteId للخدمات لتعرف أي موقع تجلب بياناته
      DashboardService.fetchStats(Number(siteId)), 
      DashboardService.fetchActivity(Number(siteId)),
      DashboardService.fetchPluginsData(Number(siteId)),
      DashboardService.buildLayout(),
      DashboardService.getSystemHealth(),
      DashboardService.getPluginStatus(),
      DashboardService.fetchLiveEvents()
    ]);

    return res.json({
      success: true, // يفضل دائماً إضافة نجاح العملية
      data: {
        stats,
        activity,
        plugins: pluginsData,
        layout,
        system,
        runtime: {
          plugins: pluginStatus,
          events: liveEvents
        }
      }
    });

  } catch (error: any) {
    console.error("Dashboard Error:", error);
    return res.status(500).json({ message: error.message });
  }
};



const getPermissions = (role: string) => ({
  canEditLayout: role === "admin",
  canUsePlugins: true,
});
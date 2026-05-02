// modules/dashboard/dashboard.controller.ts

import { Response } from "express";
import { AuthRequest } from "../../shared/auth.util";
import * as DashboardService from "./dashboard.service";
import { SiteMember } from "../../models";

export const getDashboardFull = async (req: AuthRequest, res: Response) => {
  try {
    const { siteId } = req.params;
    const userId = req.user?.id;

    if (!siteId) {
      return res.status(400).json({ message: "siteId required" });
    }

    // 🔒 IMPORTANT: check access via SiteMember
    const member = await SiteMember.findOne({
      where: { siteId, userId }
    });

    if (!member) {
      return res.status(403).json({ message: "No access to this site" });
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
      DashboardService.fetchStats(Number(siteId)),
      DashboardService.fetchActivity(Number(siteId)),
      DashboardService.fetchPluginsData(Number(siteId)),
      DashboardService.buildLayout(),
      DashboardService.getSystemHealth(),
      DashboardService.getPluginStatus(),
      DashboardService.fetchLiveEvents()
    ]);

    return res.json({
      success: true,
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

  } catch (err: any) {
    console.error(err);
    return res.status(500).json({ message: err.message });
  }
};
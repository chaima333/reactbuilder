import { Response } from "express";
import * as DashboardService from "../services/dashboard.service";
import SiteMember from "../../../models/SiteMember";
import { AuthRequest } from "../../../shared/auth.util";

export const getDashboardFull = async (req: AuthRequest, res: Response) => {
  try {
    const { siteId } = req.params;
    const userId = req.user?.id;

    if (!siteId) {
      return res.status(400).json({ message: "siteId required" });
    }

    // 🔒 access check
    const member = await SiteMember.findOne({
      where: { siteId, userId }
    });

    if (!member) {
      return res.status(403).json({ message: "No access to this site" });
    }

    const [
      stats,
      pluginsData,
      layout,
      system,
      pluginStatus
    ] = await Promise.all([
      DashboardService.fetchStats(Number(siteId)),
      DashboardService.fetchPluginsData(Number(siteId)),
      DashboardService.buildLayout(),
      DashboardService.getSystemHealth(),
      DashboardService.getPluginStatus()
    ]);

    return res.json({
      success: true,
      data: {
        stats,
        plugins: pluginsData,
        layout,
        system,
        runtime: {
          plugins: pluginStatus
        }
      }
    });

  } catch (err: any) {
    console.error(err);
    return res.status(500).json({ message: err.message });
  }
};
// modules/dashboard/dashboard.controller.ts

import { Response } from "express";
import { AuthRequest } from "../../shared/auth.util";
import * as DashboardService from "./dashboard.service";
import { User } from "../../models/User";

export const getDashboardFull = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const user = await User.findByPk(userId);
    if (!user) throw new Error("User not found");

    const [
      stats,
      activity,
      pluginsData,
      layout,
      system,
      pluginStatus,
      liveEvents
    ] = await Promise.all([
      DashboardService.fetchStats(userId),
      DashboardService.fetchActivity(userId),
      DashboardService.fetchPluginsData(userId),
      DashboardService.buildLayout(),
      DashboardService.getSystemHealth(),
      DashboardService.getPluginStatus(),
      DashboardService.fetchLiveEvents()
    ]);

    return res.json({
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
    return res.status(500).json({ message: error.message });
  }
};

const getPermissions = (role: string) => ({
  canEditLayout: role === "admin",
  canUsePlugins: true,
});
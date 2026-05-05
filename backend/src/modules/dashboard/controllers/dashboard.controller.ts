import { Response } from "express";
import * as DashboardService from "../services/dashboard.service";
import SiteMember from "../../../models/SiteMember";
import { AuthRequest } from "../../../shared/auth.util";
import { DashboardProjection } from "../projections/dashboard.projection";
import { cmsRegistry } from "../../../core/plugins/plugin.registry";
import { fetchSignals } from "../services/dashboard.signals";

export const getDashboardFull = async (req: AuthRequest, res: Response) => {
  try {
    const { siteId } = req.params;
    const userId = req.user?.id;

    if (!siteId) {
      return res.status(400).json({ message: "siteId required" });
    }

    const member = await SiteMember.findOne({
      where: { siteId, userId }
    });

    if (!member) {
      return res.status(403).json({ message: "No access to this site" });
    }

    const [stats, plugins, layout, system, pluginStatus] =
      await Promise.all([
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
        plugins,
        layout,
        system,
        runtime: {
          pluginsCount: pluginStatus.length
        }
      }
    });

  } catch (err: any) {
    return res.status(500).json({ message: err.message });
  }
};
export const rebuildDashboardProjection = async (siteId: number) => {

  const stats = await DashboardService.fetchStats(siteId);
  const signals = await fetchSignals(siteId);
  const plugins = cmsRegistry.getAllPlugins();

  const snapshot = {
    stats,
    signals,
    plugins: plugins.map(p => ({
      name: p.name,
      enabled: p.enabled
    })),
    generatedAt: new Date().toISOString()
  };

  await DashboardProjection.save(siteId, snapshot);
};
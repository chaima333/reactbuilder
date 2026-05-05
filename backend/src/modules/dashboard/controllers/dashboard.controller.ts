import { Response } from "express";
import * as DashboardService from "../services/dashboard.service";
import SiteMember from "../../../models/SiteMember";
import { AuthRequest } from "../../../shared/auth.util";
import { cmsRegistry } from "../../../core/plugins/plugin.registry";
import { fetchSignals } from "../services/dashboard.signals";
import { DashboardProjection } from "../projections/dashboard.projection";

export const getDashboardFull = async (req, res) => {
  const siteId = Number(req.params.siteId);

  const cached = await DashboardProjection.get(siteId);

  if (cached) {
    return res.json({
      success: true,
      data: cached
    });
  }

  return res.status(202).json({
    success: false,
    message: "Dashboard not ready yet"
  });
};
export const rebuildDashboardProjection = async (siteId: number) => {

  const stats = await DashboardService.fetchStats(siteId);
  const signals = await fetchSignals(siteId);
  const plugins = cmsRegistry.getAllPlugins();
 console.log("🔥 REBUILD RUNNING");
  const snapshot = {
    stats,
    signals,
    plugins: plugins.map(p => ({
      name: p.name,
      enabled: p.enabled,
      priority: p.priority,
      hasDashboard: !!p.meta?.dashboard
    })),
    generatedAt: new Date().toISOString()
  };

  await DashboardProjection.save(siteId, snapshot);
};
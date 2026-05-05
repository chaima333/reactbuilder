import { QueryTypes } from "sequelize";
import { Page, Site } from "../../../models";
import { sequelize } from "../../../core/database/connection";
import { cmsRegistry } from "../../../core/plugins/plugin.registry";

// 🔥 STATS
export const fetchStats = async (siteId: number) => {
  const site = await Site.findByPk(siteId);

  const totalPages = await Page.count({ where: { siteId } });
  const totalViews = await Page.sum("views", { where: { siteId } });

  const monthlyStatsRaw = await sequelize.query(
    `
    SELECT DATE_TRUNC('month', "created_at") as month, COUNT(*) as count
    FROM pages
    WHERE "site_id" = :siteId
    GROUP BY month
    ORDER BY month DESC
    LIMIT 12
    `,
    {
      replacements: { siteId },
      type: QueryTypes.SELECT
    }
  );

  return {
    totalSites: 1,
    totalPages,
    totalViews: totalViews || 0,
    siteName: site?.name || "Unknown",
    chartData: (monthlyStatsRaw as any[]).map((m) => ({
      month: m.month,
      count: Number(m.count)
    }))
  };
};

// 🔥 PLUGINS DATA (read-only)
export const fetchPluginsData = async (siteId: number) => {
  const plugins = cmsRegistry.getAllPlugins();
  const results: Record<string, any> = {};

  for (const plugin of plugins) {
    if (plugin.getDashboardData) {
      try {
        results[plugin.name] = await plugin.getDashboardData(siteId);
      } catch {
        results[plugin.name] = { error: "failed" };
      }
    }
  }

  return results;
};

// 🔥 SYSTEM HEALTH
export const getSystemHealth = async () => ({
  status: "healthy",
  queue: "running",
  pluginEngine: "active",
  eventBus: "connected",
  lastCheck: new Date().toISOString()
});

// 🔥 PLUGIN STATUS (snapshot فقط)
export const getPluginStatus = () => {
  return cmsRegistry.getAllPlugins().map(p => ({
    name: p.name,
    events: p.events,
    priority: p.priority,
    critical: p.isCritical || false
  }));
};

// 🔥 LAYOUT
export const buildLayout = async () => {
  const plugins = cmsRegistry.getAllPlugins();

  return {
    blocks: plugins
      .filter(p => p.meta?.dashboard)
      .sort((a, b) => (a.meta!.dashboard!.order || 0) - (b.meta!.dashboard!.order || 0))
      .map(p => ({
        id: p.name,
        type: p.meta!.dashboard!.type,
        col: p.meta!.dashboard!.col
      }))
  };
};
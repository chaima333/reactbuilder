// modules/dashboard/dashboard.service.ts

import { cmsRegistry } from "../../core/plugins/plugin.registry";
import { Site, Page, ActivityLog } from "../../models";
import { sequelize } from "../../core/database/connection";
import { QueryTypes } from "sequelize";
import { eventStore } from "../../core/plugins/events/event.store";

export const fetchStats = async (userId: number) => {
  const [totalSites, totalPages, totalViewsSum] = await Promise.all([
    Site.count({ where: { ownerId: userId } }),
    Page.count({ where: { userId } }),
    Page.sum("views", { where: { userId } }),
  ]);

  const monthlyStatsRaw = await sequelize.query(
    `
    SELECT DATE_TRUNC('month', "createdAt") as month, COUNT(*) as count 
    FROM pages 
    WHERE "userId" = :userId 
    GROUP BY month 
    ORDER BY month DESC 
    LIMIT 12
    `,
    { replacements: { userId }, type: QueryTypes.SELECT }
  );

  const chartData = (monthlyStatsRaw as any[]).map((m) => ({
    month: m.month,
    count: Number(m.count),
  }));

  return {
    totalSites,
    totalPages,
    totalViews: totalViewsSum || 0,
    chartData,
  };
};

export const fetchActivity = async (userId: number) => {
  return await ActivityLog.findAll({
    where: { userId },
    limit: 10,
    order: [["createdAt", "DESC"]],
    include: [{ association: "user", attributes: ["id", "name"] }],
  });
};

// 🔥 NEW: plugins dynamic data
export const fetchPluginsData = async (userId: number) => {
  const plugins = cmsRegistry.getAllPlugins();

  const results: Record<string, any> = {};

  for (const plugin of plugins) {
    if (plugin.getDashboardData) {
      try {
        results[plugin.name] = await plugin.getDashboardData(userId);
      } catch (e) {
        results[plugin.name] = { error: "failed" };
      }
    }
  }

  return results;
};

// 🔥 NEW: layout dynamic
export const buildLayout = async () => {
  const plugins = cmsRegistry.getAllPlugins();

  const blocks = plugins
    .filter(p => p.meta?.dashboard)
    .sort((a, b) => (a.meta!.dashboard!.order || 0) - (b.meta!.dashboard!.order || 0))
    .map(p => ({
      id: p.name,
      type: p.meta!.dashboard!.type,
      col: p.meta!.dashboard!.col,
    }));

  return { blocks };
};
// 🔥 NEW: system health check

export const getSystemHealth = async () => {
  return {
    status: "healthy",
    queue: "running",
    pluginEngine: "active",
    eventBus: "connected",
    lastCheck: new Date().toISOString()
  };
};

export const getPluginStatus = () => {
  const plugins = cmsRegistry.getAllPlugins();

  return plugins.map(p => ({
    name: p.name,
    events: p.events,
    priority: p.priority,
    critical: p.isCritical || false
  }));
};
// 🔥 NEW: live events feed
export const fetchLiveEvents = async () => {
  return eventStore.getLatest();
};
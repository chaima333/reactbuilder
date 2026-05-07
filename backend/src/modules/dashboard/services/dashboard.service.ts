import { QueryTypes } from "sequelize";
import { Page, Site, ActivityLog } from "../../../models";
import { sequelize } from "../../../core/database/connection";
import { cmsRegistry } from "../../../core/plugins/plugin.registry";
import { redis } from "../../../core/queues/config";

// =====================================================
// 🔥 STATS
// =====================================================
export const fetchStats = async (siteId: number) => {
  const cacheKey = `dashboard:stats:${siteId}`;

  // cache
  const cached = await redis.get(cacheKey);
  if (cached) return JSON.parse(cached);

  const site = await Site.findByPk(siteId);

  const totalPages = await Page.count({ where: { siteId } });
  const totalViews = await Page.sum("views", { where: { siteId } });

  const monthlyStatsRaw = await sequelize.query(
    `
    SELECT DATE_TRUNC('month', "createdAt") as month, COUNT(*) as count
    FROM "Pages"
    WHERE "siteId" = :siteId
    GROUP BY month
    ORDER BY month DESC
    LIMIT 12
    `,
    {
      replacements: { siteId },
      type: QueryTypes.SELECT
    }
  );

  const result = {
    totalSites: 1,
    totalPages,
    totalViews: totalViews || 0,
    siteName: site?.name || "Unknown",
    chartData: (monthlyStatsRaw as any[]).map((m) => ({
      month: m.month,
      count: Number(m.count)
    }))
  };

  await redis.set(cacheKey, JSON.stringify(result), "EX", 30);

  return result;
};

// =====================================================
// 🔥 PLUGINS DATA
// =====================================================
export const fetchPluginsData = async (siteId: number) => {
  const plugins = cmsRegistry.getAllPlugins();

  return plugins.map((p) => ({
    name: p.name,
    enabled: p.enabled,
    priority: p.priority,
    hasDashboard: !!p.getDashboardData
  }));
};

// =====================================================
// 🔥 SYSTEM HEALTH
// =====================================================
export const getSystemHealth = async () => {
  return {
    status: "healthy",
    queue: "running",
    pluginEngine: "active",
    eventBus: "connected",
    lastCheck: new Date().toISOString()
  };
};

// =====================================================
// 🔥 PLUGIN STATUS
// =====================================================
export const getPluginStatus = () => {
  return cmsRegistry.getAllPlugins().map((p) => ({
    name: p.name,
    events: p.events,
    priority: p.priority,
    critical: p.isCritical || false
  }));
};

// =====================================================
// 🔥 LAYOUT
// =====================================================
export const buildLayout = async () => {
  const plugins = cmsRegistry.getAllPlugins();

  return {
    blocks: plugins
      .filter((p) => p.meta?.dashboard)
      .sort(
        (a, b) =>
          (a.meta!.dashboard!.order || 0) -
          (b.meta!.dashboard!.order || 0)
      )
      .map((p) => ({
        id: p.name,
        type: p.meta!.dashboard!.type,
        col: p.meta!.dashboard!.col
      }))
  };
};
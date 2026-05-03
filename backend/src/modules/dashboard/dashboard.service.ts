import { cmsRegistry } from "../../core/plugins/plugin.registry";
import { Site, Page, ActivityLog } from "../../models";
import { sequelize } from "../../core/database/connection";
import { QueryTypes } from "sequelize";
// تأكد من المسار الصحيح للـ eventStore
import { eventStore } from "../../core/plugins/events/event.store"; 

// 🔥 STATS (site scoped)
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

// 🔥 ACTIVITY (History from DB)
export const fetchActivity = async (siteId: number) => {
  return ActivityLog.findAll({
    where: { siteId },
    limit: 10,
    order: [["createdAt", "DESC"]],
    include: [{ association: "user", attributes: ["id", "name"] }]
  });
};

// 🔥 PLUGINS DATA
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

// 🔥 RUNTIME PLUGINS STATUS
export const getPluginStatus = () => {
  return cmsRegistry.getAllPlugins().map(p => ({
    name: p.name,
    events: p.events,
    priority: p.priority,
    critical: p.isCritical || false
  }));
};

/**
 * 🔥 LIVE EVENTS (The Missing Piece)
 * هذي الدالة توّة مربوطة بالـ Redis مباشرة عبر الـ eventStore
 */
export const fetchLiveEvents = async () => {
  try {
    // نعيطو للـ Redis باش يرجعلنا الـ list متاع الـ events الأخيرة
    const latestEvents = await eventStore.getLatest();
    return latestEvents || [];
  } catch (error) {
    console.error("🚨 [DashboardService] Failed to fetch live events:", error);
    return [];
  }
};

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
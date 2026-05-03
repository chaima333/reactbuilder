// modules/dashboard/dashboard.service.ts

import { cmsRegistry } from "../../core/plugins/plugin.registry";
import { Site, Page, ActivityLog } from "../../models";
import { sequelize } from "../../core/database/connection";
import { QueryTypes } from "sequelize";
import { eventStore } from "../../core/plugins/events/event.store";

// 🔥 STATS (site scoped)
export const fetchStats = async (siteId: number) => {
  const site = await Site.findByPk(siteId);

  // Sequelize هنا يحول التسمية تلقائياً، فلا خوف منها
  const totalPages = await Page.count({ where: { siteId } });
  const totalViews = await Page.sum("views", { where: { siteId } });

  // 🛠️ الإصلاح الجذري هنا: تغيير الأسماء لتطابق قاعدة البيانات (snake_case)
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

// 🔥 ACTIVITY
export const fetchActivity = async (siteId: number) => {
  return ActivityLog.findAll({
    where: { siteId },
    limit: 10,
    order: [["createdAt", "DESC"]], // Sequelize سيهتم بالتحويل لـ created_at
    include: [{ association: "user", attributes: ["id", "name"] }]
  });
};

// باقي الدوال تبقى كما هي لأنها لا تستخدم Raw SQL
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

export const getSystemHealth = async () => ({
  status: "healthy",
  queue: "running",
  pluginEngine: "active",
  eventBus: "connected",
  lastCheck: new Date().toISOString()
});

export const getPluginStatus = () => {
  return cmsRegistry.getAllPlugins().map(p => ({
    name: p.name,
    events: p.events,
    priority: p.priority,
    critical: p.isCritical || false
  }));
};

export const fetchLiveEvents = async () => {
  return eventStore.getLatest();
};
// modules/dashboard/services/dashboard.service.ts

import { QueryTypes } from "sequelize";
import { Page, Site } from "../../../models";
import { sequelize } from "../../../core/database/connection";
import { cmsRegistry } from "../../../core/plugins/plugin.registry";
import { redis } from "../../../core/queues/config";


// =====================================================
// 🔥 STATS (Cached + Fallback DB)
// =====================================================

export const fetchStats = async (siteId: number) => {
  const cacheKey = `dashboard:stats:${siteId}`;

  try {
    // 1️⃣ حاول من cache
    const cached = await redis.get(cacheKey);
    if (cached) {
      return JSON.parse(cached);
    }

    // 2️⃣ fallback → DB
    const site = await Site.findByPk(siteId);

    const totalPages = await Page.count({
      where: { siteId }
    });

    const totalViews = await Page.sum("views", {
      where: { siteId }
    });

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

    // 3️⃣ cache لمدة قصيرة
    await redis.set(cacheKey, JSON.stringify(result), "EX", 30);

    return result;

  } catch (err) {
    console.error("❌ fetchStats error:", err);
    return {
      totalSites: 0,
      totalPages: 0,
      totalViews: 0,
      siteName: "Error",
      chartData: []
    };
  }
};


// =====================================================
// 🔥 PLUGINS DATA (READ ONLY)
// =====================================================

export const fetchPluginsData = async (siteId: number) => {
  const plugins = cmsRegistry.getAllPlugins();

  return plugins.map(p => ({
    name: p.name,
    enabled: p.enabled,
    events: p.events,
    hasDashboard: !!p.getDashboardData
  }));
};


// =====================================================
// 🔥 SYSTEM HEALTH (STATIC SNAPSHOT)
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
// 🔥 PLUGIN STATUS (STATIC SNAPSHOT)
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
// 🔥 DASHBOARD LAYOUT (FROM PLUGINS META)
// =====================================================

export const buildLayout = async () => {
  const plugins = cmsRegistry.getAllPlugins();

  return {
    blocks: plugins
      .filter(p => p.meta?.dashboard)
      .sort((a, b) =>
        (a.meta!.dashboard!.order || 0) -
        (b.meta!.dashboard!.order || 0)
      )
      .map(p => ({
        id: p.name,
        type: p.meta!.dashboard!.type,
        col: p.meta!.dashboard!.col
      }))
  };
};
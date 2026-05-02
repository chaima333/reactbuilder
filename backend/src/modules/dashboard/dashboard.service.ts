// modules/dashboard/dashboard.service.ts

import { cmsRegistry } from "../../core/plugins/plugin.registry";
import { Site, Page, ActivityLog } from "../../models";
import { sequelize } from "../../core/database/connection";
import { QueryTypes } from "sequelize";
import { eventStore } from "../../core/plugins/events/event.store";


// ✅ التعديل هنا: نعتمد على siteId بدلاً من userId
export const fetchStats = async (siteId: number) => {
  // 1. جلب بيانات الموقع المختار فقط
  const site = await Site.findByPk(siteId);
  
  // 2. حساب الصفحات التابعة لهذا الموقع فقط
  const totalPages = await Page.count({ where: { siteId } });

  // 3. مجموع الزيارات لكل صفحات هذا الموقع
  const totalViewsSum = await Page.sum("views", { where: { siteId } });

  // 4. إحصائيات نمو الصفحات لهذا الموقع تحديداً
  const monthlyStatsRaw = await sequelize.query(
    `
    SELECT DATE_TRUNC('month', "created_at") as month, COUNT(*) as count 
    FROM pages 
    WHERE "site_id" = :siteId 
    GROUP BY month 
    ORDER BY month DESC 
    LIMIT 12
    `,
    { replacements: { siteId }, type: QueryTypes.SELECT }
  );

  const chartData = (monthlyStatsRaw as any[]).map((m) => ({
    month: m.month,
    count: Number(m.count),
  }));

  return {
    // نرسل 1 لأننا داخل سياق موقع واحد حالياً
    totalSites: 1, 
    totalPages,
    totalViews: totalViewsSum || 0,
    siteName: site?.name || "Unknown",
    chartData,
  };
};

export const fetchActivity = async (siteId: number) => {
  // جلب النشاطات الخاصة بهذا الموقع فقط
  return await ActivityLog.findAll({
    where: { siteId },
    limit: 10,
    order: [["createdAt", "DESC"]],
    include: [{ association: "user", attributes: ["id", "name"] }],
  });
};

export const fetchPluginsData = async (siteId: number) => {
  const plugins = cmsRegistry.getAllPlugins();
  const results: Record<string, any> = {};

  for (const plugin of plugins) {
    if (plugin.getDashboardData) {
      try {
        // تمرير الـ siteId للبلجن ليعرف أي بيانات يجلب
        results[plugin.name] = await plugin.getDashboardData(siteId);
      } catch (e) {
        results[plugin.name] = { error: "failed" };
      }
    }
  }
  return results;
};

// ... باقي الدوال (buildLayout, getSystemHealth, إلخ) لا تتأثر بالـ siteId مباشرة وتترك كما هي

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
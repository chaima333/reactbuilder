import { Response } from "express";
import * as DashboardService from "../services/dashboard.service";
import { cmsRegistry } from "../../../core/plugins/plugin.registry";
import { fetchSignals } from "../services/dashboard.signals";
import { DashboardProjection } from "../projections/dashboard.projection";

export const getDashboardFull = async (req, res) => {
  try {
    const siteId = Number(req.params.siteId);

    // 1. نلوجو في الكاش
    let cached = await DashboardProjection.get(siteId);

    // 2. إذا موش موجود، نصنعوه توة (Rebuild)
    if (!cached) {
      console.log(`🚀 No cache found for site ${siteId}, rebuilding...`);
      await rebuildDashboardProjection(siteId);
      cached = await DashboardProjection.get(siteId);
    }

    // 3. نرجعو الداتا (Success) - هذي توة تخدم ديما كي تبدا الداتا حاضرة
    return res.json({
      success: true,
      data: cached
    });

  } catch (error) {
    console.error("❌ Error in getDashboardFull:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error"
    });
  }
};

export const rebuildDashboardProjection = async (siteId: number) => {
  const stats = await DashboardService.fetchStats(siteId);
  const signals = await fetchSignals(siteId);
  const plugins = cmsRegistry.getAllPlugins();
  
  console.log("🔥 REBUILD RUNNING FOR SITE:", siteId);

  const snapshot = {
    stats,
    signals,
    plugins: plugins.map(p => ({
      name: p.name,
      enabled: p.enabled,
      priority: p.priority,
      // التصلّيح متاع الـ hasDashboard: نثبتو في الـ function موجودة أو لا
      hasDashboard: typeof (p as any).getDashboardData === 'function'
    })),
    // نزيدو الـ layout باش الـ Front يعرف كيفاش يعرضهم
    layout: {
        blocks: plugins
          .filter(p => (p as any).meta?.dashboard)
          .map(p => ({
            id: p.name,
            type: (p as any).meta.dashboard.type,
            col: (p as any).meta.dashboard.col
          }))
    },
    generatedAt: Date.now() // استعمل timestamp أسهل للـ Front
  };

  await DashboardProjection.save(siteId, snapshot);
};
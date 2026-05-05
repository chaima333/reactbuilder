import { Response } from "express";
import * as DashboardService from "../services/dashboard.service";
import { cmsRegistry } from "../../../core/plugins/plugin.registry";
import { fetchSignals } from "../services/dashboard.signals";
import { DashboardProjection } from "../projections/dashboard.projection";

/**
 * جلب بيانات لوحة التحكم كاملة
 */
export const getDashboardFull = async (req, res) => {
  try {
    const siteId = Number(req.params.siteId);

    // 1. نلوّجوا في الكاش (Projection)
    let cached = await DashboardProjection.get(siteId);

    // 2. إذا الكاش موش موجود، نصنعوه بالسيف (Force Rebuild)
    if (!cached) {
      console.log(`🚀 [Dashboard] No cache for site ${siteId}, rebuilding now...`);
      await rebuildDashboardProjection(siteId);
      cached = await DashboardProjection.get(siteId);
    }

    // 3. نرجعوا البيانات
    return res.json({
      success: true,
      data: cached
    });

  } catch (error) {
    console.error("❌ [Dashboard Error]:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error"
    });
  }
};

/**
 * إعادة بناء بيانات الـ Dashboard وتخزينها
 */
export const rebuildDashboardProjection = async (siteId: number) => {
  try {
    const stats = await DashboardService.fetchStats(siteId);
    const signals = await fetchSignals(siteId);
    const rawPlugins = cmsRegistry.getAllPlugins();

    // 🔥 الـ Magic هنا: نلموا الـ data متاع الـ plugins الكل في وقت واحد
    const processedPlugins = await Promise.all(
      rawPlugins.map(async (p: any) => {
        let dashboardData = null;
        
        // إذا الـ plugin عندو ميثود داتا، نعيطولها
        if (typeof p.getDashboardData === 'function') {
          try {
            dashboardData = await p.getDashboardData(siteId);
          } catch (e) {
            console.error(`❌ Data fetch failed for ${p.name}:`, e);
          }
        }

        return {
          name: p.name,
          enabled: p.enabled,
          priority: p.priority,
          hasDashboard: !!p.meta?.dashboard || !!dashboardData,
          data: dashboardData // 🎯 الـ Payload وصل للـ Snapshot!
        };
      })
    );

    const snapshot = {
      stats,
      signals,
      plugins: processedPlugins,
      layout: {
        blocks: rawPlugins
          .filter((p: any) => p.meta?.dashboard)
          .map((p: any) => ({
            id: p.name,
            type: p.meta.dashboard.type,
            col: p.meta.dashboard.col,
            order: p.meta.dashboard.order || 0
          }))
      },
      generatedAt: Date.now()
    };

    await DashboardProjection.save(siteId, snapshot);
    console.log(`✅ System Dynamic: Snapshot updated with plugin data for site ${siteId}`);
  } catch (error) {
    console.error("❌ Rebuild System Failure:", error);
  }
};
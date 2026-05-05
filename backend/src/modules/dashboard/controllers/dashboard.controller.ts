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
    const plugins = cmsRegistry.getAllPlugins();
    
    console.log(`🔥 [Rebuild] Processing ${plugins.length} plugins for site ${siteId}`);

    // معالجة الـ Plugins بجلب بياناتهم إذا كانت الميثود موجودة
    const processedPlugins = await Promise.all(plugins.map(async (p: any) => {
      // التثبت من وجود ميثود جلب البيانات
      const hasMethod = typeof p.getDashboardData === 'function';
      // التثبت من وجود تعريف في الـ Meta
      const hasMeta = !!p.meta?.dashboard;

      let pluginData = null;
      if (hasMethod) {
        try {
          pluginData = await p.getDashboardData(siteId);
        } catch (e) {
          console.error(`⚠️ Error fetching data for plugin ${p.name}:`, e);
        }
      }

      return {
        name: p.name,
        enabled: p.enabled,
        priority: p.priority,
        hasDashboard: hasMethod || hasMeta, // 🔥 هنا التصليح: إذا وحدة منهم true تطلع true
        data: pluginData
      };
    }));

    const snapshot = {
      stats,
      signals,
      plugins: processedPlugins,
      layout: {
        blocks: plugins
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

    // حفظ النسخة الجديدة في الـ DB
    await DashboardProjection.save(siteId, snapshot);
    console.log(`✅ [Rebuild] Dashboard projection saved for site ${siteId}`);

  } catch (error) {
    console.error("❌ [Rebuild Error]:", error);
    throw error;
  }
};
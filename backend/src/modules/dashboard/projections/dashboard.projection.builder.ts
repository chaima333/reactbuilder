// src/modules/dashboard/projections/dashboard.projection.builder.ts
import { DashboardProjection } from "../projections/dashboard.projection";
import * as DashboardService from "../services/dashboard.service";
import { fetchSignals } from "../services/dashboard.signals";
import { DashboardWidgetService } from "../services/dashboard.widgets.service";

export const rebuildDashboardProjection = async (siteId: number) => {
  try {
    console.log(`🛠️ Rebuilding projection for site: ${siteId}`);

    // جلب البيانات مع ضمان عدم رجوع undefined
    const stats = (await DashboardService.fetchStats(siteId)) || { 
      siteName: "New Project", totalPages: 0, totalViews: 0 
    };

    const signals = (await fetchSignals(siteId)) || { 
      totalActivities: 0, lastActivity: null, chartData: [] 
    };

    const widgets = (await DashboardWidgetService.getWidgets(siteId)) || [];

    const coreBlocks = [
      { id: "stats-core", type: "stats", col: 12, order: 0 },
      { id: "chart-core", type: "chart", col: 8, order: 1 },
      { id: "activity-core", type: "activity", col: 4, order: 2 }
    ];

    const widgetBlocks = widgets.map((w: any, index: number) => ({
      id: w.id,
      type: w.type,
      col: w.col || 6,
      order: w.order || (100 + index)
    }));

    const snapshot = {
      stats,
      signals,
      widgets,
      layout: {
        blocks: [...coreBlocks, ...widgetBlocks].sort((a, b) => a.order - b.order)
      },
      meta: {
        generatedAt: Date.now(),
        siteId: siteId // أضفنا الـ siteId للميتا للتأكد من البيانات
      }
    };

    // حفظ في Redis
    await DashboardProjection.save(siteId, snapshot);
    
    return snapshot;
  } catch (error: any) {
    console.error(`❌ Builder Failed:`, error.message);
    return null;
  }
};
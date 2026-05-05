import {
  fetchStats,
  fetchPluginsData,
  buildLayout
} from "../services/dashboard.service";

import { fetchSignals } from "./dashboard.signals";
import { DashboardProjection } from "../projections/dashboard.projection";

export const rebuildDashboardProjection = async (siteId: number) => {
  
  // 🔥 نجمعو كل البيانات بشكل واضح
  const [stats, signals, plugins] = await Promise.all([
    fetchStats(siteId),
    fetchSignals(siteId),
    fetchPluginsData(siteId)
  ]);

  // 🔥 نبنيو snapshot نظيف
  const snapshot = {
    stats,
    signals,

    plugins: plugins.map(p => ({
      name: p.name,
      enabled: p.enabled,
      priority: p.priority,
      hasDashboard: p.hasDashboard
    })),

    layout: await buildLayout(),

    generatedAt: Date.now()
  };

  // 💾 save projection
  await DashboardProjection.save(siteId, snapshot);
};
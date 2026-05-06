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

      widgets: plugins,

    layout: await buildLayout(),

    generatedAt: Date.now()
  };

  // 💾 save projection
  await DashboardProjection.save(siteId, snapshot);
};
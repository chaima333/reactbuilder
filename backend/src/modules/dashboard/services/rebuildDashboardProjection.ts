import {
  fetchStats
} from "../services/dashboard.service";

import { fetchSignals }
from "./dashboard.signals";

import { DashboardProjection }
from "../projections/dashboard.projection";

import { DashboardWidgetService }
from "../services/dashboard.widgets.service";

export const rebuildDashboardProjection =
async (siteId: number) => {

  /**
   * ============================================
   * FETCH CORE DATA
   * ============================================
   */

  const [stats, signals, widgets] =
    await Promise.all([

      fetchStats(siteId),

      fetchSignals(siteId),

      DashboardWidgetService.getWidgets(siteId)

    ]);

  /**
   * ============================================
   * BUILD LAYOUT
   * ============================================
   */

  const coreBlocks = [

    {
      id: "stats-core",
      type: "stats",
      col: 12,
      order: 0
    },

    {
      id: "chart-core",
      type: "chart",
      col: 8,
      order: 1
    },

    {
      id: "activity-core",
      type: "activity",
      col: 4,
      order: 2
    }

  ];

  const widgetBlocks = widgets.map(
    (w: any, index: number) => ({

      id: w.id,

      type: w.type,

      col: 6,

      order: 100 + index

    })
  );

  /**
   * ============================================
   * FINAL SNAPSHOT
   * ============================================
   */

  const snapshot = {

    stats,

    signals,

    widgets,

    layout: {

      blocks: [

        ...coreBlocks,

        ...widgetBlocks

      ]

    },

    meta: {

      generatedAt: Date.now(),

      schemaVersion: 1,

      cacheTTL: 300

    }

  };

  /**
   * ============================================
   * SAVE PROJECTION
   * ============================================
   */

  await DashboardProjection.save(
    siteId,
    snapshot
  );

  console.log(
    `📊 Dashboard rebuilt for site: ${siteId}`
  );

};
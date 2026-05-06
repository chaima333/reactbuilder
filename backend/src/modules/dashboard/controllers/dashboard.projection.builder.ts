// src/modules/dashboard/projections/dashboard.projection.builder.ts

import { DashboardProjection } from "../projections/dashboard.projection";
import * as DashboardService from "../services/dashboard.service";
import { fetchSignals } from "../services/dashboard.signals";
import { DashboardWidgetService } from "../services/dashboard.widgets.service";

export const rebuildDashboardProjection =
async (siteId: number) => {

  const stats =
    await DashboardService.fetchStats(siteId);

  const signals =
    await fetchSignals(siteId);

  const widgets =
    await DashboardWidgetService.getWidgets(siteId);

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

  const widgetBlocks = widgets.map((w: any) => ({

    id: w.id,

    type: w.type,

    col: w.col || 6,

    order: w.order || 100

  }));

  const snapshot = {

    stats,

    signals,

    widgets,

    layout: {

      blocks: [

        ...coreBlocks,

        ...widgetBlocks

      ].sort(
        (a: any, b: any) =>
          a.order - b.order
      )

    },

    meta: {

      generatedAt:
        Date.now(),

      schemaVersion: 1,

      cacheTTL: 300

    }

  };

  await DashboardProjection.save(
    siteId,
    snapshot
  );

  console.log(
    `✅ Dashboard projection rebuilt (${siteId})`
  );

  return snapshot;
};
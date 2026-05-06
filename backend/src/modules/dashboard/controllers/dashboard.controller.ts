// src/modules/dashboard/controllers/dashboard.controller.ts

import { Response } from "express";
import * as DashboardService from "../services/dashboard.service";
import { fetchSignals } from "../services/dashboard.signals";
import { DashboardProjection } from "../projections/dashboard.projection";
import { DashboardWidgetService } from "../services/dashboard.widgets.service";

/**
 * =====================================================
 * GET FULL DASHBOARD
 * =====================================================
 */

export const getDashboardFull = async (
  req: any,
  res: Response
) => {

  try {

    const siteId = Number(req.params.siteId);

    /**
     * =================================================
     * TRY CACHE
     * =================================================
     */

    let snapshot =
      await DashboardProjection.get(siteId);

    /**
     * =================================================
     * REBUILD IF EMPTY
     * =================================================
     */

    if (!snapshot) {

      console.log(
        `🚀 [Dashboard] rebuilding snapshot for site ${siteId}`
      );

      snapshot =
        await buildDashboardProjection(siteId);
    }

    return res.json({
      success: true,
      data: snapshot
    });

  } catch (error: any) {

    console.error(
      "❌ Dashboard Error:",
      error.message
    );

    return res.status(500).json({
      success: false,
      message: "Internal Server Error"
    });
  }
};

/**
 * =====================================================
 * BUILD DASHBOARD SNAPSHOT
 * =====================================================
 */

export const buildDashboardProjection =
async (siteId: number) => {

  /**
   * ===================================================
   * CORE READ MODELS
   * ===================================================
   */

  const stats =
    await DashboardService.fetchStats(siteId);

  const signals =
    await fetchSignals(siteId);

  /**
   * ===================================================
   * WIDGET ENGINE
   * ===================================================
   */

  const widgets =
    await DashboardWidgetService.getWidgets(siteId);

  /**
   * ===================================================
   * CORE LAYOUT
   * ===================================================
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

  /**
   * ===================================================
   * DYNAMIC WIDGET BLOCKS
   * ===================================================
   */

  const widgetBlocks = widgets.map((w: any) => ({

    id: w.id,

    type: w.type,

    col: w.col || 6,

    order: w.order || 100

  }));

  /**
   * ===================================================
   * FINAL SNAPSHOT
   * ===================================================
   */

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

  /**
   * ===================================================
   * SAVE SNAPSHOT
   * ===================================================
   */

  await DashboardProjection.save(
    siteId,
    snapshot
  );

  console.log(
    `✅ Dashboard snapshot rebuilt (${siteId})`
  );

  return snapshot;
};
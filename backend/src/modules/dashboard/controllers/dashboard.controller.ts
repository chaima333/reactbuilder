import { Response } from "express";

import * as DashboardService
from "../services/dashboard.service";

import { cmsRegistry }
from "../../../core/plugins/plugin.registry";

import { fetchSignals }
from "../services/dashboard.signals";

import { DashboardProjection }
from "../projections/dashboard.projection";

/**
 * =====================================================
 * GET FULL DASHBOARD
 * =====================================================
 */

export const getDashboardFull = async (
  req,
  res
) => {

  try {

    const siteId =
      Number(req.params.siteId);

    /**
     * =================================================
     * TRY CACHE
     * =================================================
     */

    let cached =
      await DashboardProjection.get(
        siteId
      );

    /**
     * =================================================
     * FORCE REBUILD IF EMPTY
     * =================================================
     */

    if (!cached) {

      console.log(
        `🚀 [Dashboard] No cache for site ${siteId}, rebuilding now...`
      );

      await rebuildDashboardProjection(
        siteId
      );

      cached =
        await DashboardProjection.get(
          siteId
        );
    }

    /**
     * =================================================
     * RESPONSE
     * =================================================
     */

    return res.json({

      success: true,

      data: cached

    });

  } catch (error) {

    console.error(
      "❌ [Dashboard Error]:",
      error
    );

    return res.status(500).json({

      success: false,

      message:
        "Internal Server Error"

    });
  }
};

/**
 * =====================================================
 * REBUILD DASHBOARD SNAPSHOT
 * =====================================================
 */

export const rebuildDashboardProjection =
async (siteId: number) => {

  try {

    /**
     * ===============================================
     * CORE DATA
     * ===============================================
     */

    const stats =
      await DashboardService.fetchStats(
        siteId
      );

    const signals =
      await fetchSignals(siteId);

    /**
     * ===============================================
     * PLUGINS
     * ===============================================
     */

    const rawPlugins =
      cmsRegistry.getAllPlugins();

    /**
     * ===============================================
     * PROCESS PLUGIN DASHBOARD DATA
     * ===============================================
     */

    const processedPlugins =
      await Promise.all(

        rawPlugins.map(
          async (p: any) => {

            let dashboardData = null;

            /**
             * -------------------------------------------
             * FETCH DASHBOARD DATA
             * -------------------------------------------
             */

            if (
              typeof p.getDashboardData
              === "function"
            ) {

              try {

                dashboardData =
                  await p.getDashboardData(
                    siteId
                  );

              } catch (e) {

                console.error(
                  `❌ Dashboard data failed for plugin: ${p.name}`,
                  e
                );
              }
            }

            return {

              name: p.name,

              enabled: p.enabled,

              priority: p.priority,

              hasDashboard:
                !!p.meta?.dashboard,

              data: dashboardData

            };
          }
        )
      );

    /**
     * ===============================================
     * CORE WIDGETS
     * ===============================================
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
     * ===============================================
     * PLUGIN WIDGETS
     * ===============================================
     */

    const pluginBlocks = rawPlugins

      .filter(
        (p: any) =>
          p.meta?.dashboard
      )

      .map((p: any) => ({

        id: p.name,

        type:
          p.meta.dashboard.type,

        col:
          p.meta.dashboard.col,

        order:
          p.meta.dashboard.order
          || 100

      }));

    /**
     * ===============================================
     * FINAL SNAPSHOT
     * ===============================================
     */

    const snapshot = {

      /**
       * ---------------------------------------------
       * CORE DATA
       * ---------------------------------------------
       */

      stats,

      signals,

      /**
       * ---------------------------------------------
       * PROCESSED PLUGINS
       * ---------------------------------------------
       */

      plugins: processedPlugins,

      /**
       * ---------------------------------------------
       * DYNAMIC LAYOUT ENGINE
       * ---------------------------------------------
       */

      layout: {

        blocks: [

          ...coreBlocks,

          ...pluginBlocks

        ]

          /**
           * -----------------------------------------
           * SORT BY ORDER
           * -----------------------------------------
           */

          .sort(
            (
              a: any,
              b: any
            ) =>
              a.order - b.order
          )

      },

      /**
       * ---------------------------------------------
       * SNAPSHOT METADATA
       * ---------------------------------------------
       */

      generatedAt:
        Date.now()

    };

    /**
     * ===============================================
     * SAVE PROJECTION
     * ===============================================
     */

    await DashboardProjection.save(
      siteId,
      snapshot
    );

    console.log(
      `✅ Dashboard snapshot rebuilt for site ${siteId}`
    );

  } catch (error) {

    console.error(
      "❌ Rebuild Dashboard Failure:",
      error
    );
  }
};
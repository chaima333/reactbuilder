// src/modules/dashboard/projections/dashboard.projection.ts

import {
  redis
} from "../../../core/cache/config";

const KEY = (
  siteId: number
) =>
  `dashboard:projection:${siteId}`;

export const DashboardProjection = {

  /**
   * =========================================
   * GET SNAPSHOT
   * =========================================
   */

  async get(
    siteId: number
  ) {

    try {

      /**
       * =====================================
       * CACHE DISABLED (DEBUG MODE)
       * =====================================
       */

      console.log(
        `❄️ Cache Disabled for site ${siteId}`
      );

      return null;

      /**
       * =====================================
       * ORIGINAL CACHE LOGIC
       * =====================================
       */

      // const data =
      //   await redis.get(
      //     KEY(siteId)
      //   );

      // if (data) {

      //   console.log(
      //     `📡 Cache Hit for site ${siteId}`
      //   );

      //   return JSON.parse(data);
      // }

      // console.log(
      //   `❄️ Cache Miss for site ${siteId}`
      // );

      // return null;

    } catch (err: any) {

      console.error(
        "⚠️ Redis GET Error:",
        err.message
      );

      return null;
    }
  },

  /**
   * =========================================
   * SAVE SNAPSHOT
   * =========================================
   */

  async save(
    siteId: number,
    snapshot: any
  ) {

    try {

      /**
       * =====================================
       * CACHE DISABLED (DEBUG MODE)
       * =====================================
       */

      console.log(
        `💾 Snapshot skipped for site ${siteId}`
      );

      return;

      /**
       * =====================================
       * ORIGINAL CACHE LOGIC
       * =====================================
       */

      // await redis.set(
      //   KEY(siteId),
      //   JSON.stringify(snapshot),
      //   "EX",
      //   3600
      // );

      // console.log(
      //   `💾 Snapshot stored in Redis for site ${siteId}`
      // );

    } catch (err: any) {

      console.error(
        "⚠️ Redis SAVE Error:",
        err.message
      );
    }
  }
};
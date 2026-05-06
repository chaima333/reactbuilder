// src/modules/dashboard/services/dashboard.widgets.service.ts

import { cmsRegistry }
from "../../../core/plugins/plugin.registry";

export class DashboardWidgetService {

  static async getWidgets(
    siteId: number
  ) {

    const plugins =
      cmsRegistry.getAllPlugins();

    const widgets = await Promise.all(

      plugins.map(async (plugin: any) => {

        /**
         * =============================================
         * PLUGIN HAS NO DASHBOARD
         * =============================================
         */

        if (!plugin.meta?.dashboard) {
          return null;
        }

        let data = null;

        /**
         * =============================================
         * SAFE DASHBOARD DATA
         * =============================================
         */

        if (
          typeof plugin.getDashboardData
          === "function"
        ) {

          try {

            data =
              await plugin.getDashboardData(
                siteId
              );

          } catch (error) {

            console.error(
              `❌ Widget failed: ${plugin.name}`
            );
          }
        }

        /**
         * =============================================
         * SAFE WIDGET CONTRACT
         * =============================================
         */

        return {

          id: plugin.name,

          type:
            plugin.meta.dashboard.type,

          enabled:
            plugin.enabled,

          col:
            plugin.meta.dashboard.col || 6,

          order:
            plugin.meta.dashboard.order || 100,

          data

        };

      })

    );

    return widgets.filter(Boolean);
  }
}
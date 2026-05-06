import { cmsRegistry }
from "../../../core/plugins/plugin.registry";

export class DashboardWidgetService {

  static async getWidgets(siteId: number) {

    const plugins =
      cmsRegistry.getAllPlugins();

    const widgets = await Promise.all(

      plugins.map(async (plugin: any) => {

        /**
         * =============================================
         * NO DASHBOARD SUPPORT
         * =============================================
         */

        if (!plugin.meta?.dashboard) {
          return null;
        }

        let payload = null;

        /**
         * =============================================
         * SAFE PLUGIN PAYLOAD
         * =============================================
         */

        if (
          typeof plugin.getDashboardData
          === "function"
        ) {

          try {

            payload =
              await plugin.getDashboardData(
                siteId
              );

          } catch (error) {

            console.error(
              `❌ Widget failed: ${plugin.name}`
            );

            payload = {
              error: true
            };
          }
        }

        /**
         * =============================================
         * CLEAN WIDGET CONTRACT
         * =============================================
         */

        return {

          id:
            plugin.name,

          type:
            plugin.meta.dashboard.type,

          enabled:
            plugin.enabled,

          layout: {

            col:
              plugin.meta.dashboard.col || 6,

            // 🔥 IMPORTANT FIX
            order:
              (plugin.meta.dashboard.order || 0) + 100

          },

          payload

        };

      })

    );

    return widgets.filter(Boolean);
  }
}
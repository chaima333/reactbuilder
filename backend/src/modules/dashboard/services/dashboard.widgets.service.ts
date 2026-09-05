import { cmsRegistry } from "../../../core/plugins/plugin.registry";
import { ICmsPlugin } from "../../../core/plugins/plugin.types";
import { DashboardWidget } from "../dashboard.dto";
import { Plugin, SitePlugin } from "../../../models";

export class DashboardWidgetService {
  static async getWidgets(
    siteId: number,
    context?: { userId?: number },
  ): Promise<DashboardWidget[]> {
    const plugins = cmsRegistry.getAllPlugins();

    const widgets = await Promise.all(
      plugins.map(
        async (plugin: ICmsPlugin): Promise<DashboardWidget | null> => {
          /**
           * =============================================
           * NO DASHBOARD SUPPORT
           * =============================================
           */

          if (!plugin.meta?.dashboard) {
            return null;
          }
          const configuredPlugin = await Plugin.findOne({
            where: {
              slug: plugin.name,
            },
          });

          if (!configuredPlugin) {
            return null;
          }

          const sitePlugin = await SitePlugin.findOne({
            where: {
              siteId,
              pluginId: configuredPlugin.id,
            },
          });

          if (!sitePlugin || !sitePlugin.isEnabled) {
            return null;
          }

          let payload = null;

          /**
           * =============================================
           * SAFE PLUGIN PAYLOAD
           * =============================================
           */

          if (typeof plugin.getDashboardData === "function") {
            try {
              payload = await plugin.getDashboardData(siteId, context);
            } catch (error) {
              console.error(`❌ Widget failed: ${plugin.name}`);

              payload = {
                error: true,
              };
            }
          }

          /**
           * =============================================
           * CLEAN WIDGET CONTRACT
           * =============================================
           */

          return {
            id: plugin.name,

            type: plugin.meta.dashboard.type,

            enabled: plugin.enabled,

            payload,

            title: plugin.meta.dashboard.title,

            col: plugin.meta.dashboard.col,

            order: plugin.meta.dashboard.order,
          };
        },
      ),
    );

    return widgets.filter(Boolean);
  }
}

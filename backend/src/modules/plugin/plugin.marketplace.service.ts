import { Plugin } from "../../models/Plugin";
import { SitePlugin } from "../../models/SitePlugin";
import { cmsRegistry } from "../../core/plugins/plugin.registry";

export class PluginMarketplaceService {
  static async getMarketplace(siteId: number) {
    const plugins = await Plugin.findAll({
      order: [["name", "ASC"]],
    });

    const installed = await SitePlugin.findAll({
      where: { siteId },
    });

    const installedMap = new Map(
      installed.map((item) => [item.pluginId, item])
    );

    const runtimePlugins = cmsRegistry.getRegisteredPlugins();

    return plugins.map((plugin) => {
      const runtimePlugin = runtimePlugins.find(
        (item) => item.name === plugin.slug
      );

      const sitePlugin = installedMap.get(plugin.id);

      return {
        id: plugin.id,
        name: plugin.name,
        slug: plugin.slug,
        description: plugin.description,
        version: plugin.version,
        author: plugin.author,
        category: plugin.category,
        icon: plugin.icon,
        status: plugin.status,

        runtimeEnabled: runtimePlugin?.enabled ?? false,
        priority: runtimePlugin?.priority ?? 0,
        events: runtimePlugin?.events ?? [],

        installed: !!sitePlugin,
        enabled: sitePlugin?.isEnabled ?? false,
        installedVersion: sitePlugin?.installedVersion ?? null,
      };
    });
  }

  static async installPlugin(siteId: number, pluginId: number) {
    const plugin = await Plugin.findByPk(pluginId);

    if (!plugin) {
      throw new Error("Plugin not found");
    }

    const [sitePlugin] = await SitePlugin.findOrCreate({
      where: {
        siteId,
        pluginId,
      },
      defaults: {
        siteId,
        pluginId,
        isEnabled: true,
        installedAt: new Date(),
        installedVersion: plugin.version,
      },
    });

    return sitePlugin;
  }

  static async enablePlugin(siteId: number, pluginId: number) {
    const sitePlugin = await SitePlugin.findOne({
      where: {
        siteId,
        pluginId,
      },
    });

    if (!sitePlugin) {
      throw new Error("Plugin is not installed");
    }

    sitePlugin.isEnabled = true;
    await sitePlugin.save();

    return sitePlugin;
  }

  static async disablePlugin(siteId: number, pluginId: number) {
    const sitePlugin = await SitePlugin.findOne({
      where: {
        siteId,
        pluginId,
      },
    });

    if (!sitePlugin) {
      throw new Error("Plugin is not installed");
    }

    sitePlugin.isEnabled = false;
    await sitePlugin.save();

    return sitePlugin;
  }

  static async uninstallPlugin(siteId: number, pluginId: number) {
    const deleted = await SitePlugin.destroy({
      where: {
        siteId,
        pluginId,
      },
    });

    if (!deleted) {
      throw new Error("Plugin is not installed");
    }

    return true;
  }
}
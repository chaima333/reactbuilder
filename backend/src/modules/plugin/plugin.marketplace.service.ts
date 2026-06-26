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
        permissions: runtimePlugin?.permissions ?? [],

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

    const [sitePlugin, created] = await SitePlugin.findOrCreate({
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

    if (!created) {
      sitePlugin.isEnabled = true;

      if (!sitePlugin.installedAt) {
        sitePlugin.installedAt = new Date();
      }

      if (!sitePlugin.installedVersion) {
        sitePlugin.installedVersion = plugin.version;
      }

      await sitePlugin.save();
    }

    const runtimePlugin = cmsRegistry.getPlugin(plugin.slug);

    if (runtimePlugin?.onInstall) {
      await runtimePlugin.onInstall(siteId);
    }

    return sitePlugin;
  }

  static async enablePlugin(siteId: number, pluginId: number) {
    const plugin = await Plugin.findByPk(pluginId);

    if (!plugin) {
      throw new Error("Plugin not found");
    }

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

    const runtimePlugin = cmsRegistry.getPlugin(plugin.slug);

    if (runtimePlugin?.onEnable) {
      await runtimePlugin.onEnable(siteId);
    }

    return sitePlugin;
  }

  static async disablePlugin(siteId: number, pluginId: number) {
    const plugin = await Plugin.findByPk(pluginId);

    if (!plugin) {
      throw new Error("Plugin not found");
    }

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

    const runtimePlugin = cmsRegistry.getPlugin(plugin.slug);

    if (runtimePlugin?.onDisable) {
      await runtimePlugin.onDisable(siteId);
    }

    return sitePlugin;
  }

  static async uninstallPlugin(siteId: number, pluginId: number) {
    const plugin = await Plugin.findByPk(pluginId);

    if (!plugin) {
      throw new Error("Plugin not found");
    }

    const sitePlugin = await SitePlugin.findOne({
      where: {
        siteId,
        pluginId,
      },
    });

    if (!sitePlugin) {
      throw new Error("Plugin is not installed");
    }

    const runtimePlugin = cmsRegistry.getPlugin(plugin.slug);

    if (runtimePlugin?.onUninstall) {
      await runtimePlugin.onUninstall(siteId);
    }

    await sitePlugin.destroy();

    return true;
  }
}
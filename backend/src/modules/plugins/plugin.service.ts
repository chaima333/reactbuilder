import { SitePlugin } from "../../models/SitePlugin";
import { Plugin } from "../../models/Plugin";

export class PluginService {
  static async getEnabledSlugs(siteId: number): Promise<string[]> {
    const sitePlugins = await SitePlugin.findAll({
      where: { siteId, isEnabled: true },
      include: [
        {
          model: Plugin,
          as: "plugin",
          attributes: ["slug"],
        },
      ],
    });

    return sitePlugins
      .map((sp) => sp.plugin?.slug)
      .filter((slug): slug is string => Boolean(slug));
  }
}
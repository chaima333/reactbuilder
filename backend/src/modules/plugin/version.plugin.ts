import { PageVersion } from "../../models/pageVersion";
import { ICmsPlugin } from "../../core/plugins/plugin.types";

export const VersionPlugin: ICmsPlugin = {
  name: "version-plugin",
  mode: "sync",
  priority: 100,
  isCritical: true,
  events: ["page.updated"],
  enabled: true,

  meta: {
    dashboard: {
      type: "widget.version.summary",
      col: 6,
      order: 1
    }
  },

  async getDashboardData(siteId: number) {
    const totalVersions = await PageVersion.count({
      where: { siteId }
    });

    const lastVersion = await PageVersion.findOne({
      where: { siteId },
      order: [["createdAt", "DESC"]]
    });

    return {
      totalVersions,
      lastBackup: lastVersion?.createdAt
    };
  },

  async execute(_event: any) {
    // Update snapshots are persisted transactionally by updatePageHandler.
    // The plugin remains available for dashboard version metadata.
  }
};

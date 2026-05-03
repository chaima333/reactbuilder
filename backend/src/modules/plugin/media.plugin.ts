// modules/plugin/media.plugin.ts

import { ICmsPlugin } from "../../core/plugins/plugin.types";
import { Media } from "../../models";

export const MediaPlugin: ICmsPlugin = {
  name: "media",
  priority: 10,
  mode: "async",
  events: ["page.updated"],
  enabled: true,

  meta: {
    dashboard: {
      type: "media",
      col: 6,
      order: 2
    }
  },

  async getDashboardData(siteId: number) {
    const totalFiles = await Media.count({ where: { siteId } });

    return {
      totalFiles
    };
  },

  async execute(event, payload) {
    // logic متاعك
  }
};
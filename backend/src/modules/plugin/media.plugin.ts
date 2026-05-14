
import { UnifiedEvent } from "../../core/plugins/events/contracts/unified.contract";
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
      type: "widget.media.summary",
      col: 6,
      order: 2
    }
  },

 async getDashboardData(
  siteId: number
) {

  const items =
    await Media.findAll({

      where: { siteId },

      limit: 5,

      order: [
          ["created_at", "DESC"]
      ]
    });

  const totalFiles =
    await Media.count({

      where: { siteId }
    });

  return {

    totalFiles,

    storageUsed:
      `${totalFiles} files`,
    


    items
  };
},
  async execute(event: UnifiedEvent) {
    const { data, context, type } = event;
    
  }
};
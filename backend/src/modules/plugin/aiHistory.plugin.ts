import { AiGeneration } from "../../models/AiGeneration";
import { ICmsPlugin } from "../../core/plugins/plugin.types";

export const AiHistoryPlugin: ICmsPlugin = {
  name: "ai-history-plugin",
  mode: "sync",
  priority: 100,
  isCritical: false,
  events: ["site.created"],
  enabled: true,

  permissions: [
  "dashboard.read"
],

  meta: {
    dashboard: {
      type: "widget.ai.history",
      col: 12,
      order: 90
    }
  },

  async getDashboardData(siteId: number) {
    const history = await AiGeneration.findAll({
      where: { siteId },
      order: [["createdAt", "DESC"]],
      limit: 5
    });

    return {
      history
    };
  },

  async execute(_event: any) {
    // Dashboard-only plugin.
  }
};
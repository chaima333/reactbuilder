import { UnifiedEvent } from "../../core/plugins/events/contracts/unified.contract";
import { ICmsPlugin } from "../../core/plugins/plugin.types";
import { Op } from "sequelize";

import { Page }
from "../../models";
import { requirePermission } from "./plugin.permissions";

export const SEOPlugin: ICmsPlugin = {
  name: "seo-plugin",
  mode: "async",
  priority: 50,
  isCritical: false,
  events: ["page.updated", "page.restored"],
  enabled: true,

  permissions: [
  "pages.read",
  "seo.read",
  "seo.write",
  "dashboard.read"
],

  meta: {
    dashboard: {
      type: "widget.seo.score",
      col: 6,
      order: 2
    }
  },

async getDashboardData(
  siteId: number
) {

  const totalPages =
    await Page.count({

      where: { siteId }
    });

  return {

    seoScore:
      totalPages > 0
        ? 100
        : 0,

    optimizedPages:
      totalPages
  };
},

  async execute(event: UnifiedEvent) {
    requirePermission(SEOPlugin,"seo.write");
    const { data, context, id } = event;
    const { current, flags } = data;

    if (!id) {
      console.error("🚨 SEOPlugin: Identifiant d'événement manquant");
      return;
    }

    if (!flags?.shouldSEO) {
      return;
    }

    if (!current?.title) {
      console.log("🟡 SEO skipped: missing title");
      return;
    }

    console.log(`🔍 SEO processing: ${current.title} | Event ID: ${id}`);
  }
};
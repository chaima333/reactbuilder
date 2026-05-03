// modules/plugin/media.plugin.ts

import { UnifiedEvent } from "../../core/plugins/events/contracts/pageUpdated.event";
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
    return { totalFiles };
  },

  // ✅ التعديل هنا: بارامتر واحد واستخراج البيانات منه
  async execute(event: UnifiedEvent) {
    const { data, context, type } = event;
    
    // منطق الـ Plugin الخاص بك هنا
    // مثال: console.log(`Processing media for page: ${data.current?.id}`);
  }
};
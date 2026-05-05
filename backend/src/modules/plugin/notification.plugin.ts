// modules/plugin/notification.plugin.ts

import { UnifiedEvent } from "../../core/plugins/events/contracts/unified.contract";
import { ICmsPlugin } from "../../core/plugins/plugin.types";

export const NotificationPlugin: ICmsPlugin = {
  name: "notification-plugin",
  mode: "async",
  priority: 10,
  isCritical: true,
  events: ["page.updated"],
  enabled: true,

  // ✅ التعديل هنا: استخدام event.data للوصول للمعلومات
  async execute(event: UnifiedEvent) {
    const { data, id } = event;
    
    // لاحظ أننا نصل لـ title عبر data.current
    console.log(`🔔 notify: ${data.current?.title} | Event ID: ${id}`);
  }
};
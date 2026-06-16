import { UnifiedEvent } from "../../core/plugins/events/contracts/unified.contract";
import { ICmsPlugin } from "../../core/plugins/plugin.types";

export const NotificationPlugin: ICmsPlugin = {
  name: "notification-plugin",
  mode: "async",
  priority: 10,
  isCritical: true,
  events: [
  "site.created",
  "page.created",
  "page.updated",
  "page.published",
],
  enabled: true,

  async execute(event: UnifiedEvent) {
    console.log(
      "🔔 NOTIFICATION EVENT",
      JSON.stringify(event, null, 2)
    );
  },
};
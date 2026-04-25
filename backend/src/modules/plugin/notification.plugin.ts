import { ICmsPlugin } from "../../core/plugins/plugin.interface";
import { PAGE_EVENTS } from "../../core/plugins/events/pageEvents";

export const NotificationPlugin: ICmsPlugin = {
  name: "notification-plugin",
  mode: "async",
  priority: 10,
  events: [PAGE_EVENTS.UPDATED],
  enabled: true,

  register() {
    console.log("🔌 [NotificationPlugin]: Registered for async alerts");
  },

  async execute(event, { page }: any) {
    console.log(`🔔 [Worker]: Sending notification for ${page.title}`);
  }
};
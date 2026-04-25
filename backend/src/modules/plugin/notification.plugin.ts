import { ICmsPlugin } from "../../core/plugins/plugin.interface";

export const NotificationPlugin: ICmsPlugin = {
  name: "notification-plugin",
  mode: "async",
  priority: 10,
  events: ["page.updated"],
  enabled: true,

  async execute(event, payload) {
    console.log("🔔 notify:", payload.current?.title);
  }
};
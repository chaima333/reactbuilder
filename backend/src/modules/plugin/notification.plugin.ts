import { Plugin } from "../../core/plugins/plugin.interface";
import { PAGE_EVENTS } from "../../core/plugins/events/pageEvents";

export const NotificationPlugin: Plugin = {
  name: "notification-plugin",
  events: [PAGE_EVENTS.UPDATED],
  priority: 10,
  mode: "async",
  enabled: true,

  // 1. هذي الخدمة اللي باش تولي تخدم في الـ Background
  async execute(event, payload) {
    const { page, userId } = payload;
    console.log(`🔔 [Async Worker]: Sending notification for ${page.title}...`);
    // حط الـ logic متاع الـ Notification هوني
  },

  register({ eventBus }) {
    // خليها فارغة أو حط فيها Log بركة
    console.log("🔌 Notification Plugin registered (Async)");
  }
};
import { Plugin } from "../../core/plugins/plugin.interface";
import { PAGE_EVENTS } from "../../core/plugins/events/pageEvents";

export const NotificationPlugin: Plugin = {
  name: "notification-plugin",
  events: [PAGE_EVENTS.UPDATED],
  priority: 1, // أولويّة منخفضة (يخدم بعد الـ Versioning والـ SEO)
  enabled: true,

  register({ eventBus }) {
    eventBus.on(PAGE_EVENTS.UPDATED, async ({ page, userId }) => {
      console.log(`🔔 [Notification]: Page "${page.title}" was updated by User ID: ${userId}`);
      
      // هنا تنجم تزيد Logic متاع بعث إيميل أو Notification للـ Admin
      // await EmailService.sendAdminAlert(...);
    });
  }
};
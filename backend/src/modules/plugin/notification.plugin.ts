import { Plugin } from "../../core/plugins/plugin.interface";
import { PAGE_EVENTS } from "../../core/plugins/events/pageEvents";

export const NotificationPlugin: Plugin = {
  name: "notification-plugin",
  events: [PAGE_EVENTS.UPDATED],
  priority: 1, 
  enabled: true,

  register({ eventBus }) {
    // 1. نعرّفو الـ Handler لبرّة باش نتحكمو فيه
    const handler = async (payload: any) => {
      const { page, userId } = payload;
      console.log(`🔔 [Notification]: Page "${page.title}" was updated by User ID: ${userId}`);
      
      // مثال: await EmailService.sendAdminAlert(...);
    };

    // 2. 🔥 نلصقو الاسم (هذا اللي يخلّي الـ Performance log يطلع فيه "notification-plugin")
    (handler as any).pluginName = this.name;

    // 3. نربطوه بالـ EventBus
    eventBus.on(PAGE_EVENTS.UPDATED, handler);
  }
};
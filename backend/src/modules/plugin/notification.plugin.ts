// modules/plugin/notification.plugin.ts

import { UnifiedEvent } from "../../core/plugins/events/contracts/unified.contract";
import { ICmsPlugin } from "../../core/plugins/plugin.types";
import { NotificationService } from "../notifications/notification.service";

export const NotificationPlugin: ICmsPlugin = {
  name: "notification-plugin",
  mode: "async",
  priority: 10,
  isCritical: true,
  events: ["page.updated"],
  enabled: true,

async execute(event: UnifiedEvent) {
  const { data, id, siteId, userId } = event as any;

  await NotificationService.create({
    userId,
    siteId,
    type: event.type,
    title: "Page updated",
    message: `${data.current?.title || "A page"} was updated`,
    metadata: {
      eventId: id,
      pageId: data.current?.id,
    },
  });

  console.log(`🔔 notification saved | Event ID: ${id}`);
}  
};
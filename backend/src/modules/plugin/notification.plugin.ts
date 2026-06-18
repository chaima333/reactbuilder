import { UnifiedEvent } from "../../core/plugins/events/contracts/unified.contract";
import { ICmsPlugin } from "../../core/plugins/plugin.types";
import { NotificationService } from "../notifications/notification.service";

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
  const eventAny = event as any;

  const userId =
    eventAny.context?.userId;

  const siteId =
    eventAny.context?.siteId;

  if (!userId) {
    console.warn(
      "🔔 Notification skipped: missing userId",
      eventAny.id
    );
    return;
  }

  await NotificationService.create({
    userId,
    siteId,
    type: eventAny.type,
    title:
      eventAny.type === "site.created"
        ? "Site created"
        : "Notification",
    message:
      eventAny.type === "site.created"
        ? `Site "${eventAny.data?.name || "New site"}" was created`
        : `${eventAny.type} event received`,
    metadata: {
      eventId: eventAny.id,
      traceId: eventAny.traceId,
    },
  });

  console.log(
    "🔔 notification saved:",
    eventAny.type,
    eventAny.id
  );
}
};
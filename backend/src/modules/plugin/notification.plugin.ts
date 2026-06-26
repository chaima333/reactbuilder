import { UnifiedEvent } from "../../core/plugins/events/contracts/unified.contract";
import { ICmsPlugin } from "../../core/plugins/plugin.types";
import { NotificationService } from "../notifications/notification.service";

export const NotificationPlugin: ICmsPlugin = {
  name: "notification-plugin",
  mode: "async",
  priority: 10,
  isCritical: true,
  events: [
    "page.created",
    "page.updated",
    "page.published",
    "page.restored",
    "media.uploaded",
    "site.updated",
  ],
  enabled: true,

  permissions: [
  "dashboard.read",
  "pages.read"
],

  meta: {
    dashboard: {
      type: "notifications",
      title: "Notifications",
      col: 4,
      order: 3,
    },
  },

  async getDashboardData(siteId: number, context?: { userId?: number }) {
    if (!context?.userId) {
      return null;
    }

    return NotificationService.getDashboardData(
      context.userId,
      siteId
    );
  },

   async execute(event: UnifiedEvent) {
    const eventAny = event as any;

    const userId = eventAny.context?.userId;
    const siteId = eventAny.context?.siteId;

    if (!userId) {
      console.warn(
        "🔔 Notification skipped: missing userId",
        eventAny.id
      );
      return;
    }

    const pageTitle =
      eventAny.data?.current?.title ||
      eventAny.data?.page?.title ||
      eventAny.data?.title ||
      "Untitled page";

    const mediaName =
      eventAny.data?.media?.originalName ||
      eventAny.data?.originalName ||
      eventAny.data?.filename ||
      "Media file";

    const titleByType: Record<string, string> = {
      "page.created": "Page created",
      "page.updated": "Page updated",
      "page.published": "Page published",
      "page.restored": "Page restored",
      "media.uploaded": "Media uploaded",
      "site.updated": "Site updated",
    };

    const messageByType: Record<string, string> = {
      "page.created": `New page "${pageTitle}" created`,
      "page.updated": `Page "${pageTitle}" updated`,
      "page.published": `Page "${pageTitle}" published`,
      "page.restored": `Page "${pageTitle}" restored`,
      "media.uploaded": `Media "${mediaName}" uploaded`,
      "site.updated": `Site settings updated`,
    };

    await NotificationService.create({
      userId,
      siteId,
      type: eventAny.type,
      title: titleByType[eventAny.type] || "Notification",
      message: messageByType[eventAny.type] || `${eventAny.type} completed`,
      metadata: {
        eventId: eventAny.id,
        traceId: eventAny.traceId,
        pageId:
          eventAny.data?.current?.id ||
          eventAny.data?.page?.id ||
          eventAny.data?.id,
        mediaId:
          eventAny.data?.media?.id ||
          eventAny.data?.id,
      },
    });

    console.log(
      "🔔 notification saved:",
      eventAny.type,
      eventAny.id
    );
  }
};

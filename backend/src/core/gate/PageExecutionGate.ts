import { PageService } from "../../modules/pages/services/page.service";
import { EventDispatcher } from "../../core/plugins/event.dispatcher";
import crypto from "crypto";

export class PageExecutionGate {

  static async updatePage(input: any) {

    const result = await PageService.updatePage(
      input.siteId,
      input.pageId,
      input.userId,
      input.data
    );

    const event = result.event;

    if (event?.shouldEmit) {

      await EventDispatcher.dispatch(
        {
          type: event.type,
          data: event.data,
          context: {
            ...event.context,
            eventId: event.meta?.eventId || crypto.randomUUID(),
            source: "page.gate"
          },
          meta: event.meta
        },
        "page.gate"
      );
    }

    return result.data;
  }
}
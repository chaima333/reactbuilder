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

    if (result.event?.shouldEmit) {

      await EventDispatcher.dispatch(
        result.event.type,
        {
          ...result.event.payload,

          context: {
            ...result.event.payload.context,
            eventId: result.event.payload.context?.eventId || crypto.randomUUID(),
            source: "page.gate"
          }
        },
        "page.gate"
      );
    }

    return result.data;
  }
}
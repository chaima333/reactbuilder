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

      const envelope = event.envelope;

      await EventDispatcher.dispatch(
        event.type,
        {
          data: envelope.data,

          context: {
            ...envelope.context,
            eventId: envelope.context?.eventId || crypto.randomUUID(),
            source: "page.gate"
          },

          meta: envelope.meta
        },
        "page.gate"
      );
    }

    return result.data;
  }
}
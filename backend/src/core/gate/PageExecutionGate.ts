import { PageService } from "../../modules/pages/services/page.service";
import crypto from "crypto";
import { EventBus } from "../plugins/events/eventBus";

export class PageExecutionGate {

  static async updatePage(input: any) {

    const result = await PageService.updatePage(
      input.siteId,
      input.pageId,
      input.userId,
      input.data
    );

    if (result.event?.shouldEmit) {

      await EventBus.emit(
  result.event.type,
  {
    type: result.event.type,

    data: {
      current: result.event.payload.current,
      previous: result.event.payload.previous,
      shouldVersion: result.event.payload.flags.shouldVersion
    },

    context: result.event.context,

    meta: {
      eventId: crypto.randomUUID(),
      timestamp: Date.now(),
      source: "page.gate"
    }
  }
);
    }

    return result.data;
  }
}
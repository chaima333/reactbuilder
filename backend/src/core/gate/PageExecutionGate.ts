import { PageService } from "../../modules/pages/services/page.service";
import { EventDispatcher } from "../../core/plugins/event.dispatcher";

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
            eventId: crypto.randomUUID(),
            userId: input.userId,
            siteId: input.siteId
          }
        },
        "page.gate"
      );

    }

    return result.data;
  }
}
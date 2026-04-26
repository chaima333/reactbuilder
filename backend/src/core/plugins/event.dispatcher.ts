import { PageUpdatedSchema } from "./events/pageEvents";
import { cmsRegistry } from "./plugin.registry";


export class EventDispatcher {
  private static processed = new Set<string>();

static async dispatch(event: string, payload: any, source: string) {

  const parsed = PageUpdatedSchema.safeParse(payload);

  if (!parsed.success) {
    console.error("🚨 Invalid event payload", parsed.error);
    return;
  }

  const validPayload = parsed.data;

  const eventId = validPayload.context.eventId;

  if (this.processed.has(eventId)) return;

  this.processed.add(eventId);
  setTimeout(() => this.processed.delete(eventId), 60000);

  await cmsRegistry.emit(event, validPayload, source);
}
}
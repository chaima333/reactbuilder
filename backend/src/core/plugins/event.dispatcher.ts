// src/core/plugins/event.dispatcher.ts

import { cmsRegistry } from "./plugin.registry";

export class EventDispatcher {
  private static processedIds = new Set<string>();

// src/core/plugins/event.dispatcher.ts

static async dispatch(event: string, payload: any, source: string) {
  const eventId = payload._meta?.eventId;

  if (this.processedIds.has(eventId)) {
    console.log(`🚫 [Dispatcher] Preventive Block: ${eventId}`);
    return;
  }

  this.processedIds.add(eventId);
  
  // 👈 تأكد إن الـ payload هوني هو الـ object اللي فيه الـ _meta
  await cmsRegistry.emit(event, payload); 
}
}
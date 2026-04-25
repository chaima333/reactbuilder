// src/core/plugins/event.dispatcher.ts

import { cmsRegistry } from "./plugin.registry";

export class EventDispatcher {
  private static processedIds = new Set<string>();

  static async dispatch(event: string, payload: any, source: string) {
    const eventId = payload._meta?.eventId;

    if (this.processedIds.has(eventId)) {
        // 🔥 هون السر: اطبع سطر فاشل باش تعرف اللي الـ Gatekeeper خدم
        console.log(`🚫 [Dispatcher] Prevented Duplicate: ${eventId}`);
        return; // نخرجوا هون وما نكلموش الـ Registry أصلاً
    }

    this.processedIds.add(eventId);
    // ...
    await cmsRegistry.emit(event, payload, source);
}
}
import { cmsRegistry } from "./plugin.registry";

// src/core/plugins/event.dispatcher.ts

export class EventDispatcher {
  private static processed = new Set<string>();

  static async dispatch(event: string, payload: any, source: string) {
    
    // 🎯 التعديل هوني: نلوجو على الـ ID داخل context
    const eventId = payload?.context?.eventId;

    if (!eventId) {
    console.error(`🚨 [Dispatcher] Missing ID for event: ${event}`);
    console.log("DEBUG PAYLOAD:", JSON.stringify(payload, null, 2)); // باش تفضح وين ضاع الـ ID
    return;
  }

    // لمنع التكرار (Idempotency)
    if (this.processed.has(eventId)) return;

    this.processed.add(eventId);
    setTimeout(() => this.processed.delete(eventId), 60000);

    // لوج نظيف ومزيان
    console.log(`📡 [Dispatcher] → ${event} | ID: ${eventId} | Source: ${source}`);

    // إرسال للـ Registry باش ينادي للـ Plugins
    await cmsRegistry.emit(event, payload, source);
  }
}
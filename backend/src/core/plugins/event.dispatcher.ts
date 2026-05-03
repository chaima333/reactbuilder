import { addToQueue } from "../queues/plugin.queue";
import { eventStore } from "./events/event.store";

// src/core/plugins/event.dispatcher.ts

export class EventDispatcher {
  private static processed = new Set<string>();

  // أضفنا "= 'system'" لجعل الوسيط اختيارياً ومنع خطأ الـ Build
  static async dispatch(event: string, payload: any, source: string = 'system') {
    const eventId = payload?.meta?.eventId || payload?.context?.eventId;

    if (!eventId) {
      console.error(`🚨 [Dispatcher] Missing ID for event: ${event}`);
      return;
    }

    if (this.processed.has(eventId)) return;
    this.processed.add(eventId);
    setTimeout(() => this.processed.delete(eventId), 60000);

    console.log(`📡 [Dispatcher] → ${event} | ID: ${eventId} | Source: ${source}`);

    // إرسال البيانات للـ Queue
    await addToQueue("plugin-tasks", { 
      type: event, // تأكد أن الـ Worker يقرأ 'type' أو 'event'
      data: payload, 
      context: payload.context,
      meta: payload.meta,
      source 
    });
  }
}
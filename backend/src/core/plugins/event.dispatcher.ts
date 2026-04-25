// src/core/plugins/event.dispatcher.ts

import { cmsRegistry } from "./plugin.registry";

export class EventDispatcher {
  private static processedIds = new Set<string>();

  static async dispatch(event: string, payload: any, source: string) {
    const eventId = payload._meta?.eventId || payload.id;

    // 🛡️ المانع قبل الانبعاث (Preventive Guard)
    if (this.processedIds.has(eventId)) {
      // نخرجوا طول قبل ما الـ Event يوصل للـ Bus أصلاً
      return; 
    }

    this.processedIds.add(eventId);
    
    // تنظيف الـ Cache بعد فترة (اختياري حسب الـ Load)
    setTimeout(() => this.processedIds.delete(eventId), 60000);

    // توّة بركة الـ Event يخرج للـ Bus
    await cmsRegistry.emit(event, payload, source);
  }
}
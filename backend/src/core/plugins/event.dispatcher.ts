import { cmsRegistry } from "./plugin.registry";

// src/core/plugins/event.dispatcher.ts

export class EventDispatcher {
  private static processed = new Set<string>();

  static async dispatch(event: string, payload: any, source: string) {
  // 1️⃣ نجبدو الـ ID من المسار الجديد (داخل context)
  const eventId = payload?.context?.eventId;

  if (!eventId) {
    console.error(`🚨 [Dispatcher] Missing ID for event: ${event}`);
    // اللوق هذا باش يوريك الـ Payload الحقيقي اللي وصل للـ Dispatcher
    console.log("🔍 DEBUG PAYLOAD STRUCTURE:", JSON.stringify(payload, null, 2));
    return;
  }

  // 2️⃣ منع التكرار
  if (this.processed.has(eventId)) return;
  this.processed.add(eventId);
  setTimeout(() => this.processed.delete(eventId), 60000);

  // 3️⃣ اللوق النظيف
  console.log(`📡 [Dispatcher] → ${event} | ID: ${eventId} | Source: ${source}`);

  // 4️⃣ التنفيذ
  await cmsRegistry.emit(event, payload, source);
}
}
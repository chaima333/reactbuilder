import { cmsRegistry } from "./plugin.registry";

export class EventDispatcher {
  private static processedIds = new Set<string>();

  static async dispatch(event: string, payload: any, source: string) {
    const eventId = payload._meta?.eventId;

    if (!eventId) return;

    // 1️⃣ التثبت والمنع لازم يكونوا أول حاجة ومن غير await
    if (this.processedIds.has(eventId)) {
      // إذا الـ ID موجود، أخرج فوراً وما تعاودش تطبع في الـ Bus
      return;
    }

    // 2️⃣ سجل الـ ID توّة (قبل الـ emit) باش أي ضربة ثانية تلقاه مسجل
    this.processedIds.add(eventId);

    // 3️⃣ اختيار اختياري: تنظيف الـ ID بعد دقيقة باش ما نعبيوش الـ RAM
    setTimeout(() => this.processedIds.delete(eventId), 60000);

    // 4️⃣ توّة ابعث للـ Bus وأنت متهنّي
    console.log(`📡 [Dispatcher] Passing to Bus: ${event} | ID: ${eventId}`);
    await cmsRegistry.emit(event, payload, source); 
  }
}
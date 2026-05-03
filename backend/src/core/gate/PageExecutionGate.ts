import { PageService } from "../../modules/pages/services/page.service";
import { EventDispatcher } from "../../core/plugins/event.dispatcher";
import crypto from "crypto";

export class PageExecutionGate {
  static async updatePage(input: any) {
    const result = await PageService.updatePage(
      input.siteId,
      input.pageId,
      input.userId,
      input.data
    );

    const event = result.event;

    if (event?.shouldEmit) {
      // التحضير للـ Payload
      const eventId = event.meta?.eventId || crypto.randomUUID();
      
      const payload = {
        type: event.type,
        data: event.data,
        context: {
          ...event.context,
          eventId: eventId,
          source: "page.gate"
        },
        meta: {
          ...event.meta,
          eventId: eventId // نضمن وجوده في الزوز بلايص
        }
      };

      // ✅ التعديل هنا: نمرر 3 وسائط منفصلة
      await EventDispatcher.dispatch(
        event.type,    // 1. الوسيط الأول: string (نوع الحدث)
        payload,       // 2. الوسيط الثاني: any (البيانات كاملة)
        "page.gate"    // 3. الوسيط الثالث: string (المصدر)
      );
    }

    return result.data;
  }
}
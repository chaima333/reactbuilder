/**
 * ترتيب الـ Keys أبجدياً لضمان إن الـ JSON stringify ديما يعطي نفس النتيجة 
 * لنفس المحتوى مهما كان ترتيب الخصائص.
 */
export function stableNormalize(value: any): any {
  if (value === null || value === undefined) return value;

  if (Array.isArray(value)) {
    return value.map(stableNormalize);
  }

  if (typeof value === "object") {
    return Object.keys(value)
      .sort()
      .reduce((acc: any, key) => {
        acc[key] = stableNormalize(value[key]);
        return acc;
      }, {});
  }

  return value;
}

const deepEqual = (a: any, b: any) =>
  JSON.stringify(stableNormalize(a)) === JSON.stringify(stableNormalize(b));

const CORE_FIELDS = ["title", "content", "blocks", "slug", "status"];

/**
 * يرجع قائمة الحقول اللي تبدلت فعلياً
 */
export function getSemanticDiff(oldPageN: any, newPageN: any): string[] {
  return CORE_FIELDS.filter(
    (field) => !deepEqual(oldPageN[field], newPageN[field])
  );
}

// src/core/events/eventGateway.ts
import { randomUUID } from "crypto";
import { EventBus } from "../../../core/plugins/events/eventBus.js";

/**
 * إرسال الـ Event مع ضمان الهوية الفريدة ومنع الـ Loops
 */
export const emitDomainEvent = async (type: string, data: any, context: any) => {
  if (!data?.current?.id) {
    console.error("❌ [EventGateway] Missing current.id, event aborted.");
    return null;
  }

  // 🆔 هوية فريدة لكل "محاولة" إرسال
  const eventId = randomUUID(); 

  return EventBus.emit({
    type,
    data,
    context: {
      ...context,
      id: eventId,
      traceId: context.traceId || eventId,
      depth: (context.depth || 0) + 1, // عداد العمق لمنع الـ Infinite Loops
      source: context.source || "page.handler"
    }
  });
};
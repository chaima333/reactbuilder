// core/domain/diff.ts
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

export function getSemanticDiff(oldPageN: any, newPageN: any) {
  return CORE_FIELDS.filter(
    (field) => !deepEqual(oldPageN[field], newPageN[field])
  );
}



// src/core/events/eventGateway.ts
import { createHash, randomUUID } from "crypto"; // استورد randomUUID
import { EventBus } from "../../../core/plugins/events/eventBus.js";

export const emitDomainEvent = async (
  type: string,
  data: any,
  context: any
) => {
  if (!data?.current?.id) {
    console.error("❌ Missing data.current.id");
    return null;
  }

  // 1️⃣ اصنع ID فريد تماماً لكل حدث (UUID)
  // هذا يضمن إنو كل سطر في الـ Logs يكون عندو هوية مستقلة
  const eventId = randomUUID(); 

  // 2️⃣ الـ eventKey هوني (Hash) نستعملوه فقط كـ "Metadata" 
  // أو إذا تحب تعمل بيه Deduplication في الـ Queue، أما الـ ID متاع الـ Event لازم يبقى فريد.
  const eventKey = createHash("sha256")
    .update(
      JSON.stringify({
        type,
        pageId: data.current.id,
        changes: data.changes || []
      })
    )
    .digest("hex");

  console.log(`📡 [EMIT] ${type} | ID: ${eventId} | Key: ${eventKey.slice(0, 8)}`);

  // 3️⃣ ابعث الحدث بالـ ID الجديد
  return EventBus.emit({
  
    type,
    data,
    context: {
      ...context,
      depth: (context.depth || 0) + 1, // <--- زيد هذي
      id: eventId,
      traceId: eventId 
    }
  });
};
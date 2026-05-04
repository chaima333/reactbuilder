const ALLOWED_FIELDS = ["title", "content", "blocks", "slug", "status", "metaData"];

export function getSemanticDiff(oldPageN: any, newPageN: any) {
  // نحصر المقارنة فقط في الـ ALLOWED_FIELDS لقتل ضجيج الـ updatedAt
  return ALLOWED_FIELDS.filter(field => {
    const oldVal = oldPageN[field];
    const newVal = newPageN[field];

    // مقارنة الـ Objects (blocks, metaData)
    if (typeof oldVal === 'object' && oldVal !== null) {
      return JSON.stringify(oldVal) !== JSON.stringify(newVal);
    }
    
    // مقارنة القيم العادية
    return oldVal !== newVal;
  });
}

// src/core/events/eventGateway.ts
import { createHash } from "crypto";
import { EventBus } from "../../../core/plugins/events/eventBus.js";
import { redis } from "../../../core/queues/config.js";




export const emitDomainEvent = async (type: string, data: any, context: any) => {
  // 🛡️ Guard Clause
  if (!data?.current?.id) {
    console.error("❌ [GATEWAY] Missing data.current.id. Cannot generate fingerprint.");
    return null;
  }

  const fingerprint = createHash('sha256')
    .update(`${type}-${data.current.id}-${JSON.stringify(data.changes)}`)
    .digest('hex');

  const lockKey = `evt:gate:${fingerprint}`;
  const isNew = await redis.set(lockKey, "active", "EX", 3600, "NX");

  if (!isNew) {
    console.warn(`🚫 [GATEWAY] Redundant event blocked: ${fingerprint}`);
    return null;
  }

  return await EventBus.emit({
    id: fingerprint,
    type,
    data,
  context: { 
      ...context, 
      source: "page.handler" }
  });
};
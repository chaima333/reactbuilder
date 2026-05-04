import { normalizePage } from "../../../core/plugins/events/contracts/unified.contract.ts";

// src/modules/pages/domain/page.logic.ts
const ALLOWED_FIELDS = ["title", "content", "blocks", "slug", "status", "metaData"];

export function getSemanticDiff(oldPage: any, newPage: any) {
  const oldN = normalizePage(oldPage);
  const newN = normalizePage(newPage);

  return ALLOWED_FIELDS.filter(field => {
    // Deep comparison للـ blocks والـ metaData
    if (typeof oldN[field] === 'object') {
      return JSON.stringify(oldN[field]) !== JSON.stringify(newN[field]);
    }
    return oldN[field] !== newN[field];
  });
}

// src/core/events/eventGateway.ts
import { createHash } from "crypto";
import { EventBus } from "../../../core/plugins/events/eventBus.js";
import { redis } from "../../../core/queues/config.js";

export const emitDomainEvent = async (type: string, data: any, context: any) => {
  // 1. توليد Unique ID بناءً على محتوى التغيير الفعلي (Deterministic ID)
  const fingerprint = createHash('sha256')
    .update(`${type}-${data.current.id}-${JSON.stringify(data.changes)}`)
    .digest('hex');

  // 2. Dedup Gate: نمنع إعادة النشر لمدة ساعة (Idempotency)
  const lockKey = `evt:gate:${fingerprint}`;
  const isNew = await redis.set(lockKey, "active", "EX", 3600, "NX");

  if (!isNew) {
    console.warn(`🚫 [GATEWAY] Redundant event blocked: ${fingerprint}`);
    return null;
  }

  // 3. النشر الوحيد والرسمي
  return await EventBus.emit({
    id: fingerprint,
    type,
    data,
    context: { ...context, source: "official_gateway" }
  });
};
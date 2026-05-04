// src/modules/pages/domain/page.logic.ts
const ALLOWED_FIELDS = ["title", "content", "blocks", "slug", "status", "metaData"];

export function getSemanticDiff(oldPageN: any, newPageN: any) {
  // 🛑 نحّينا الـ normalizePage من هنا خاطر الـ Handler هو اللي يتكفل بيها
  return ALLOWED_FIELDS.filter(field => {
    const valOld = oldPageN[field];
    const valNew = newPageN[field];

    if (typeof valOld === 'object' && valOld !== null) {
      return JSON.stringify(valOld) !== JSON.stringify(valNew);
    }
    return valOld !== valNew;
  });
}

// src/core/events/eventGateway.ts
import { createHash } from "crypto";
import { EventBus } from "../../../core/plugins/events/eventBus.js";
import { redis } from "../../../core/queues/config.js";
// src/core/events/eventGateway.ts
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
    context: { ...context, source: "official_gateway" }
  });
};
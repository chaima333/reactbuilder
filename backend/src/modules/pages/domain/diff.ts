// core/domain/diff.ts

const deepEqual = (a: any, b: any) => {
  return JSON.stringify(a) === JSON.stringify(b);
};

const CORE_FIELDS = ["title", "content", "blocks", "slug", "status"];

export function getSemanticDiff(oldPageN: any, newPageN: any) {
  return CORE_FIELDS.filter(field => {
    return !deepEqual(oldPageN[field], newPageN[field]);
  });
}

// src/core/events/eventGateway.ts
// core/events/eventGateway.ts

import { createHash } from "crypto";
import { EventBus } from "../../../core/plugins/events/eventBus.js";
import { redis } from "../../../core/queues/config.js";

export const emitDomainEvent = async (type: string, data: any, context: any) => {
  if (!data?.current?.id) {
    console.error("❌ [GATEWAY] Missing data.current.id.");
    return null;
  }

  // ✅ fingerprint يعتمد على القيم موش كان names
  const fingerprintPayload = {
    type,
    id: data.current.id,
    changes: data.changes,
    values: data.changes.map((c: string) => data.current[c])
  };

  const fingerprint = createHash("sha256")
    .update(JSON.stringify(fingerprintPayload))
    .digest("hex");

  const lockKey = `evt:gate:${fingerprint}`;
  const isNew = await redis.set(lockKey, "1", "EX", 3600, "NX");

  if (!isNew) {
    console.warn(`🚫 [GATEWAY] Redundant event blocked: ${fingerprint}`);
    return null;
  }

  return await EventBus.emit({
    id: fingerprint,
    type,
    data,
    context // ✅ ما نعاودوش override هنا
  });
};



// core/domain/diff.ts

function stableNormalize(value: any): any {
  if (Array.isArray(value)) {
    return value.map(stableNormalize);
  }

  if (value && typeof value === "object") {
    return Object.keys(value)
      .sort() // ✅ ترتيب ثابت
      .reduce((acc: any, key) => {
        acc[key] = stableNormalize(value[key]);
        return acc;
      }, {});
  }

  if (typeof value === "string") {
    return value.trim(); // ✅ قتل whitespace noise
  }

  return value;
}


const deepEqual = (a: any, b: any) => {
  return JSON.stringify(stableNormalize(a)) === JSON.stringify(stableNormalize(b));
};

const CORE_FIELDS = ["title", "content", "blocks", "slug", "status"];

export function getSemanticDiff(oldPageN: any, newPageN: any) {
  return CORE_FIELDS.filter(field => {
    return JSON.stringify(oldPageN[field]) !== JSON.stringify(newPageN[field]);
  });
}

// src/core/events/eventGateway.ts

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
  siteId: data.current.siteId,
  id: data.current.id,
  changes: data.changes,
  values: stableNormalize(
    data.changes.reduce((acc: any, key: string) => {
      acc[key] = data.current[key];
      return acc;
    }, {})
  )
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
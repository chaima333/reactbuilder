


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

const deepEqual = (a: any, b: any) => {
  return JSON.stringify(stableNormalize(a)) === JSON.stringify(stableNormalize(b));
};

const CORE_FIELDS = ["title", "content", "blocks", "slug", "status"];

export function getSemanticDiff(oldPageN: any, newPageN: any) {
  return CORE_FIELDS.filter((field) => {
    return !deepEqual(oldPageN[field], newPageN[field]);
  });
}



// src/core/events/eventGateway.ts

import { createHash } from "crypto";
import { EventBus } from "../../../core/plugins/events/eventBus.js";
import { redis } from "../../../core/queues/config.js";

export const emitDomainEvent = async (type: string, data: any, context: any) => {
  if (!data?.current?.id) {
    console.error("❌ Missing data.current.id");
    return null;
  }

  // 🔥 fingerprint يعتمد على state مش event id فقط
  const stateFingerprint = createHash("sha256")
    .update(JSON.stringify({
      type,
      id: data.current.id,
      changes: data.changes,
      current: data.current
    }))
    .digest("hex");

  const lockKey = `evt:state:${stateFingerprint}`;

  const isNew = await redis.set(lockKey, "1", "EX", 3600, "NX");

  if (!isNew) {
    console.warn(`🚫 Duplicate state event blocked: ${stateFingerprint}`);
    return null;
  }

  return EventBus.emit({
    id: stateFingerprint,
    type,
    data,
    context: {
      ...context,
      source: "page.handler"
    }
  });
};
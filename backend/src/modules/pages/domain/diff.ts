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

// src/core/events/eventGateway.ts
import { createHash } from "crypto";
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

  // 🔥 stable key ONLY on operation, not full state
  const eventKey = createHash("sha256")
    .update(
      JSON.stringify({
        type,
        pageId: data.current.id,
        changes: data.changes || []
      })
    )
    .digest("hex");

  // 🔥 IMPORTANT: EventBus + Queue will handle dedup
  return EventBus.emit({
    type,
    data,
    context: {
      ...context,
      source: "page.handler"
    }
  });
};
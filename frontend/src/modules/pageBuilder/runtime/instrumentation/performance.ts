import type { Block } from "../../types/page.types";

export type TreePerformanceMetrics = {
  blockCount: number;
  maxRenderDepth: number;
  recursiveCost: number;
};

export type DragCollisionMetrics = {
  startedAt: number;
  endedAt: number;
  durationMs: number;
  elementCount: number;
  semanticCandidateCount: number;
};

export const measureTreePerformance = (
  blocks: Block[]
): TreePerformanceMetrics => {
  let blockCount = 0;
  let maxRenderDepth = 0;

  const visit = (nodes: Block[], depth: number) => {
    maxRenderDepth = Math.max(maxRenderDepth, depth);
    blockCount += nodes.length;

    nodes.forEach((node) => {
      visit(node.children || [], depth + 1);
    });
  };

  visit(blocks, 1);

  return {
    blockCount,
    maxRenderDepth,
    recursiveCost: blockCount * maxRenderDepth
  };
};

export const measureDragCollision = <T>(
  elementCount: number,
  semanticCandidateCount: number,
  callback: () => T
): { result: T; metrics: DragCollisionMetrics } => {
  const startedAt = performance.now();
  const result = callback();
  const endedAt = performance.now();

  return {
    result,
    metrics: {
      startedAt,
      endedAt,
      durationMs: endedAt - startedAt,
      elementCount,
      semanticCandidateCount
    }
  };
};

import React, { useMemo } from "react";
import { Box, Typography } from "@mui/material";
import type { Block } from "../../types/page.types";
import { validateTreeInvariants } from "../../runtime/validation/invariants";
import { measureTreePerformance } from "../../runtime/instrumentation/performance";
import type { Operation } from "../../runtime/operations/types";

interface TreeInspectorDevtoolProps {
  blocks: Block[];
  selectedId?: string | null;
  dropTargetId?: string | null;
  resolverDecision?: unknown;
  operationHistory?: Operation[];
}

const findBlock = (blocks: Block[], id: string): Block | null => {
  for (const block of blocks) {
    if (block.id === id) return block;
    const found = findBlock(block.children || [], id);
    if (found) return found;
  }

  return null;
};

const toTreeSummary = (blocks: Block[]): unknown =>
  blocks.map((block) => ({
    id: block.id,
    type: block.type,
    children: toTreeSummary(block.children || [])
  }));

export const TreeInspectorDevtool = ({
  blocks,
  selectedId,
  dropTargetId,
  resolverDecision,
  operationHistory = []
}: TreeInspectorDevtoolProps) => {
  const invariantReport = useMemo(
    () => validateTreeInvariants(blocks),
    [blocks]
  );
  const metrics = useMemo(
    () => measureTreePerformance(blocks),
    [blocks]
  );
  const selectedNode = selectedId ? findBlock(blocks, selectedId) : null;
  const parentChain = selectedId
    ? Array.from(invariantReport.parentMap.entries())
        .reduce<string[]>((chain, [child, parent]) => {
          if (child !== selectedId) return chain;

          let current: string | undefined = parent;

          while (current && current !== "root") {
            chain.unshift(current);
            current = invariantReport.parentMap.get(current);
          }

          return chain;
        }, [])
    : [];

  return (
    <Box
      sx={{
        fontFamily: "monospace",
        fontSize: 12,
        p: 2,
        borderTop: "1px solid #ddd",
        bgcolor: "#0f172a",
        color: "#e2e8f0",
        maxHeight: 360,
        overflow: "auto"
      }}
    >
      <Typography variant="subtitle2" sx={{ color: "#fff", mb: 1 }}>
        Tree Inspector
      </Typography>
      <pre>
        {JSON.stringify(
          {
            canonicalTree: toTreeSummary(blocks),
            selectedNode,
            parentChain,
            dropTargetId,
            resolverDecision,
            operationHistory,
            invalidStates: invariantReport.violations,
            metrics
          },
          null,
          2
        )}
      </pre>
    </Box>
  );
};

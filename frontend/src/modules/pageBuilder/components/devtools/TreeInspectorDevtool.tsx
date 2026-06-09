import React, { useMemo } from "react";
import {
  Box,
  Typography
} from "@mui/material";

import type {
  Block
} from "../../types/page.types";

import {
  validateTreeInvariants
} from "../../runtime/validation/invariants";

import {
  measureTreePerformance
} from "../../runtime/instrumentation/performance";

import type {
  Operation
} from "../../runtime/operations/types";

interface DebugElement {
  tag: string;
  id: string;
  className: string;
}

interface TreeInspectorDevtoolProps {
  blocks: Block[];

  selectedId?: string | null;

  dropTargetId?: string | null;

  resolverDecision?: unknown;

  operationHistory?: Operation[];

  // 👑 semantic debugging
  pointerX?: number | null;

  pointerY?: number | null;

  semanticTargetId?: string | null;

  semanticTargetType?: string | null;

  semanticAllowed?: boolean | null;

  rawElementsFromPoint?: DebugElement[];
}

const findBlock = (
  blocks: Block[],
  id: string
): Block | null => {

  for (const block of blocks) {

    if (block.id === id) {
      return block;
    }

    const found =
      findBlock(
        block.children || [],
        id
      );

    if (found) {
      return found;
    }
  }

  return null;
};

const toTreeSummary = (
  blocks: Block[]
): unknown =>

  blocks.map((block) => ({
    id: block.id,

    type: block.type,

    children:
      toTreeSummary(
        block.children || []
      )
  }));

export const TreeInspectorDevtool = ({
  blocks,

  selectedId,

  dropTargetId,

  resolverDecision,

  operationHistory = [],

  pointerX = null,

  pointerY = null,

  semanticTargetId = null,

  semanticTargetType = null,

  semanticAllowed = null,

  rawElementsFromPoint = []
}: TreeInspectorDevtoolProps) => {

  const invariantReport =
    useMemo(
      () =>
        validateTreeInvariants(
          blocks
        ),
      [blocks]
    );

  const metrics =
    useMemo(
      () =>
        measureTreePerformance(
          blocks
        ),
      [blocks]
    );

  const selectedNode =
    selectedId
      ? findBlock(
          blocks,
          selectedId
        )
      : null;

  const parentChain =
    selectedId
      ? Array.from(
          invariantReport.parentMap.entries()
        ).reduce<string[]>(
          (
            chain,
            [child, parent]
          ) => {

            if (
              child !== selectedId
            ) {
              return chain;
            }

            let current:
              | string
              | undefined =
                parent;

            while (
              current &&
              current !== "root"
            ) {

              chain.unshift(
                current
              );

              current =
                invariantReport.parentMap.get(
                  current
                );
            }

            return chain;
          },
          []
        )
      : [];

  return (
    <Box
      sx={{
        fontFamily:
          "monospace",

        fontSize: 12,

        p: 2,

        borderTop:
          "1px solid #ddd",

        bgcolor:
          "#0f172a",

        color:
          "#e2e8f0",

        maxHeight: 420,

        overflow: "auto"
      }}
    >
      <Typography
        variant="subtitle2"
        sx={{
          color: "#fff",
          mb: 1
        }}
      >
        Tree Inspector
      </Typography>

      <pre>
        {JSON.stringify(
          {
            canonicalTree:
              toTreeSummary(
                blocks
              ),

            selectedNode,

            parentChain,

            dropTargetId,

            resolverDecision,

            operationHistory,

            invalidStates:
              invariantReport.violations,

            metrics,

            // 👑 semantic collision debug
            hoverDebug: {
              pointerX,

              pointerY,

              semanticTargetId,

              semanticTargetType,

              semanticAllowed
            },

            // 👑 raw DOM hit-testing
            rawElementsFromPoint
          },

          null,

          2
        )}
      </pre>
    </Box>
  );
};
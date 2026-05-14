import React from "react";

import { Box } from "@mui/material";

import { useDroppable }
from "@dnd-kit/core";

import { BlockRenderer }
from "../editor/BlockRenderer";

export const FlexBlock = ({
  block,
  registry,
  device,
  onUpdate,
  onDelete,
  onSelect,
  selectedId,
  activeId,
  hoverData,
  onDuplicate,
  hoveredId,
  errors
}: any) => {

  if (!block || !block.id) {
    return null;
  }

  const {
    setNodeRef,
    isOver
  } = useDroppable({
    id: block.id,
    data: {
      type: block.type,
      isContainer: true
    }
  });

  const style = {
    ...(block.data?.style?.desktop || {}),
    ...(block.data?.style?.[device] || {})
  };

  const isMobile =
    device === "mobile";

  return (

    <Box
      ref={setNodeRef}

      sx={{

        display: "flex",

        flexDirection:
          isMobile
            ? "column"
            : (
              style.flexDirection ||
              "row"
            ),

        gap:
          style.gap || "20px",

        justifyContent:
          style.justifyContent ||
          "flex-start",

        alignItems:
          style.alignItems ||
          "stretch",

        flexWrap:
          isMobile
            ? "nowrap"
            : (
              style.flexWrap ||
              "nowrap"
            ),

        width: "100%",

        minHeight:
          style.minHeight ||
          "200px",

        padding:
          style.padding ||
          "20px",

        border:
          isOver
            ? "2px solid #1976d2"
            : "2px dashed #999",

        backgroundColor:
          isOver
            ? "rgba(25,118,210,0.08)"
            : "rgba(255,0,0,0.03)",

        borderRadius: "8px",

        boxSizing: "border-box",

        position: "relative",

        transition:
          "all 0.2s ease"
      }}
    >

      {/* EMPTY STATE */}

      {(!block.children ||
        block.children.length === 0) && (

        <Box
          sx={{
            width: "100%",
            textAlign: "center",
            color: "#999",
            fontSize: "14px",
            py: 4
          }}
        >
          Drop components here
        </Box>
      )}

      {/* CHILDREN */}

      {block.children?.map(
        (child: any) => (

          child && (

            <BlockRenderer
              key={child.id}

              block={child}

              registry={registry}

              device={device}

              onUpdate={onUpdate}

              onDelete={onDelete}

              onSelect={onSelect}

              selectedId={selectedId}

              activeId={activeId}

              hoverData={hoverData}

              onDuplicate={onDuplicate}

              hoveredId={hoveredId}

              errors={errors}
            />
          )
        )
      )}

    </Box>
  );
};
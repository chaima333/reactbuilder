// src/modules/pageBuilder/runtime/renderer/EditorBlockRenderer.tsx

import React from "react";
import { Box } from "@mui/material";
import { useDroppable, useDraggable } from "@dnd-kit/core";

import { blockRegistry } from "../../core/blockRegistry";

import {
  Block,
  ValidationError,
  Device
} from "../../types/page.types";

import { RuntimeRenderer } from "./RuntimeRenderer";

// =========================
// Strict Contract
// =========================

export interface BlockComponentProps<T = Record<string, any>> {
  block: Block;
  data?: T;
  device: Device;
  children?: React.ReactNode;
}

interface Props {
  block: Block;

  device?: Device;
  preview?: boolean;

  onUpdate?: (id: string, data: any) => void;
  onDelete?: (id: string) => void;
  onDuplicate?: (id: string) => void;
  onSelect?: (id: string) => void;
  onTransform?: (id: string) => void;
  onHoverChange?: (id: string | null) => void;

  selectedId?: string | null;
  activeId?: string | null;
  hoveredId?: string | null;

  errors?: ValidationError[];

  hoverData?: {
    overId: string | null;
    dropPosition: string | null;
    isAllowed?: boolean;
  };
}

export const EditorBlockRenderer = ({
  block,

  device = "desktop",
  preview = false,

  onUpdate,
  onDelete,
  onDuplicate,
  onSelect,
  onTransform,
  onHoverChange,

  selectedId,
  activeId,
  hoveredId,

  hoverData,

  errors = []
}: Props) => {

  // =========================
  // REGISTRY RESOLUTION
  // =========================

  const config =
    blockRegistry[block.type];

  if (!config) {

    console.warn(
      `[EDITOR] Unknown block type "${block.type}"`
    );

    return null;
  }

  // =========================
  // DND
  // =========================

  const { setNodeRef } = useDroppable({
    id: block.id,
    data: {
      type: block.type
    }
  });

  const {
    attributes,
    listeners,
    setNodeRef: setDragRef
  } = useDraggable({
    id: block.id,
    data: {
      type: block.type,
      isNew: false
    }
  });

  // =========================
  // STATES
  // =========================

  const isOver =
    hoverData?.overId === block.id;

  const dropPos =
    hoverData?.dropPosition;

  const isAllowed =
    hoverData?.isAllowed ?? true;

  const isDragging =
    activeId === block.id;

  const isSelected =
    selectedId === block.id;

  const isHovered =
    hoveredId === block.id;

  const feedbackColor =
    isAllowed
      ? "#4caf50"
      : "#f44336";

  const indicatorColor =
    isAllowed
      ? "#1976d2"
      : "#f44336";

  const blockError =
    errors.find(
      (err) => err.blockId === block.id
    );

  const hasError = !!blockError;

  // =========================
  // 👑 REAL RECURSION
  // =========================

  const recursiveChildren =
    block.children?.map((child) => (

      <EditorBlockRenderer
        key={child.id}
        block={child}

        device={device}
        preview={preview}

        onUpdate={onUpdate}
        onDelete={onDelete}
        onDuplicate={onDuplicate}
        onSelect={onSelect}
        onTransform={onTransform}
        onHoverChange={onHoverChange}

        selectedId={selectedId}
        activeId={activeId}
        hoveredId={hoveredId}

        hoverData={hoverData}
        errors={errors}
      />

    ));

  return (

    <Box
  component="div"

  ref={(node: HTMLElement | null) => {
        setNodeRef(node);
        setDragRef(node);

      }}

      sx={{
        display: "contents",
        position: "relative",

        opacity:
          isDragging ? 0.3 : 1,

        outline:
          hasError
            ? "2px solid #d32f2f"
            : isHovered && !isSelected
            ? "2px solid #00bcd4"
            : "none",

        border:
          !preview && isSelected
            ? "2px solid #1976d2"
            : "1px solid transparent",

        transition: "all 0.2s ease"
      }}
    >

      {/* TOP DROP */}
      {isOver && dropPos === "before" && (

        <Box
          sx={{
            position: "absolute",
            top: -2,
            left: 0,
            right: 0,
            height: 4,
            bgcolor: indicatorColor,
            zIndex: 999
          }}
        />

      )}

      {/* =========================
          PURE RUNTIME EXECUTION
      ========================= */}

      <RuntimeRenderer
        block={block}
        device={device}
      >

        {recursiveChildren}

      </RuntimeRenderer>

      {/* =========================
          TOOLBAR
      ========================= */}

      {!preview && isSelected && (

        <Box
          sx={{
            position: "absolute",
            top: -36,
            right: 0,

            zIndex: 9999,

            display: "flex",
            gap: 1,

            bgcolor: "#fff",

            padding: "4px",

            borderRadius: "6px",

            boxShadow:
              "0 2px 10px rgba(0,0,0,0.12)"
          }}
        >

          <Box
            {...listeners}
            {...attributes}
            sx={{
              width: 32,
              height: 32,

              display: "flex",
              alignItems: "center",
              justifyContent: "center",

              bgcolor: "#111",
              color: "#fff",

              borderRadius: "6px",

              cursor: "grab"
            }}
          >
            ⋮⋮
          </Box>

          <Box
            onClick={() =>
              onDelete?.(block.id)
            }
            sx={{
              width: 32,
              height: 32,

              display: "flex",
              alignItems: "center",
              justifyContent: "center",

              bgcolor: "#f44336",
              color: "#fff",

              borderRadius: "6px",

              cursor: "pointer"
            }}
          >
            🗑️
          </Box>

        </Box>

      )}

      {/* BOTTOM DROP */}
      {isOver && dropPos === "after" && (

        <Box
          sx={{
            position: "absolute",
            bottom: -2,
            left: 0,
            right: 0,
            height: 4,
            bgcolor: indicatorColor,
            zIndex: 999
          }}
        />

      )}

    </Box>
  );
};
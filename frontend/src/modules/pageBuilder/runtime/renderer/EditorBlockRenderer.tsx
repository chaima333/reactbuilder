// src/modules/pageBuilder/runtime/renderer/EditorBlockRenderer.tsx

import React from "react";
import { Box } from "@mui/material";
import {
  useDraggable
} from "@dnd-kit/core";

import { blockRegistry } from "../../core/blockRegistry";

import {
  Block,
  ValidationError,
  Device
} from "../../types/page.types";

import { RuntimeRenderer } from "./RuntimeRenderer";

export interface BlockComponentProps<
  T = Record<string, any>
> {
  block: Block;
  data?: T;
  device: Device;
  display: "contents",
  children?: React.ReactNode;
}

interface Props {
  block: Block;
  children?: React.ReactNode;
  component?: React.ComponentType<any>;
  device?: Device;
  preview?: boolean;

  onUpdate?: (
    id: string,
    data: any
  ) => void;

  onDelete?: (
    id: string
  ) => void;

  onDuplicate?: (
    id: string
  ) => void;

  onSelect?: (
    id: string
  ) => void;

  onTransform?: (
    id: string
  ) => void;

  onHoverChange?: (
    id: string | null
  ) => void;

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
  // REGISTRY
  // =========================

  const config =
    blockRegistry[block.type];

  if (!config) {

    return null;
  }

  // =========================
  // DND
  // =========================

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

  const indicatorColor =
    isAllowed
      ? "#1976d2"
      : "#f59e0b";

  // =========================
  // RECURSION
  // =========================

  const recursiveChildren =

  (block.children || []).map(
    (child: any) => {
  
      return (

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
      )
    }
    );

  // =========================
  // RENDER
  // =========================
return (

  <div

    onClick={(e) => {

      if (
        isDragging
      ) {

        return;
      }

      e.stopPropagation();

      onSelect?.(
        block.id
      );
    }}

    id={`editor-${block.id}`}

    className="editor-wrapper"

    data-editor-block-type={block.type}

   style={{
  pointerEvents: "auto",
  position: "relative",

  display: "contents",
  width: "100%",
  maxWidth: "100%",
  minWidth: 0,

  overflow: "visible",
  boxSizing: "border-box",

  flexShrink: 1,

  opacity: isDragging ? 0.3 : 1
}}
  >

    {/* TOP INDICATOR */}

    {isOver &&
      dropPos === "before" && (

      <Box
        sx={{
          position: "absolute",
          top: -2,
          left: 0,
          right: 0,
          height: 4,
          bgcolor: indicatorColor,
          pointerEvents: "none",
          zIndex: 9999
        }}
      />
    )}

    {/* TOOLBAR */}

    {!preview &&
      isSelected && (

      <Box
        sx={{
          position: "absolute",
          top: 8,
          right: 0,
          zIndex: 99999,
          display: "flex",
          gap: 1,
          bgcolor: "#fff",
          padding: "4px",
          borderRadius: "6px",
          boxShadow:
            "0 2px 10px rgba(0,0,0,0.12)",
          pointerEvents: "auto"
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
            onDuplicate?.(
              block.id
            )
          }

          sx={{
            width: 32,
            height: 32,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            bgcolor: "#1976d2",
            color: "#fff",
            borderRadius: "6px",
            cursor: "pointer"
          }}
        >
          📄
        </Box>

        <Box
          onClick={() =>
            onDelete?.(
              block.id
            )
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

    {/* BOTTOM INDICATOR */}

    {isOver &&
      dropPos === "after" && (

      <Box
        sx={{
          position: "absolute",
          bottom: -2,
          left: 0,
          right: 0,
          height: 4,
          bgcolor: indicatorColor,
          pointerEvents: "none",
          zIndex: 9999
        }}
      />
    )}

    {/* RUNTIME */}

    <RuntimeRenderer
      block={block}
      device={device}
    >
      {recursiveChildren}
    </RuntimeRenderer>

  </div>
);
};

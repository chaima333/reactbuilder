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
import {
  RuntimeProvider,
  useRuntime
} from "../context/RuntimeProvider";

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
 

  // =========================
  // DND
  // =========================

  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef
  } = useDraggable({

    id: block.id,

    data: {
      type: block.type,
      isNew: false
    }
  });

  const runtimeContext =
    useRuntime();

  const runtimeContextWithNodeRegistration =
    React.useMemo(
      () => ({
        ...runtimeContext,

        registerRuntimeNode: (
          blockId: string,
          node: HTMLElement | null
        ) => {
          runtimeContext.registerRuntimeNode?.(
            blockId,
            node
          );

          if (blockId !== block.id) {
            return;
          }

          setNodeRef(
            node
          );
        }
      }),
    [
      block.id,
      runtimeContext,
      setNodeRef
    ]
    );
if (!config) {
  return null;
}
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
      ? "primary.main"
      : "warning.main";

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

 if (block.type === "visitorRegister") {
  console.log("VISITOR_REGISTER_RENDER", {
    id: block.id,
    type: block.type,
    data: block.data,
    configComponent: config?.component?.name,
  });
}
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
        data-testid="drop-indicator-before"
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

    {isOver &&
      dropPos === "inside" && (

      <Box
        data-testid="drop-indicator-inside"
        sx={{
          position: "absolute",
          inset: 0,
          border: 2,
          borderStyle: "dashed",
          borderColor: indicatorColor,
          pointerEvents: "none",
          zIndex: 9998
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
          bgcolor: "background.paper",
          padding: "4px",
          borderRadius: "6px",
          border: 1,
          borderColor: "divider",
          boxShadow: 3,
          pointerEvents: "auto"
        }}
      >

        <Box
          ref={setActivatorNodeRef}
          {...listeners}
          {...attributes}
          data-dnd-handle="true"
          data-testid="block-drag-handle"
          sx={{
            width: 32,
            height: 32,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            bgcolor: "action.selected",
            color: "text.primary",
            borderRadius: "6px",
            cursor: "grab",
            userSelect: "none",
            touchAction: "none",
            "&:hover": {
              bgcolor: "action.hover"
            }
          }}
        >
          ⋮⋮
        </Box>

        <Box
          data-testid="block-duplicate-button"
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
            bgcolor: "primary.main",
            color: "primary.contrastText",
            borderRadius: "6px",
            cursor: "pointer"
          }}
        >
          📄
        </Box>

        <Box
          data-testid="block-delete-button"
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
            bgcolor: "error.main",
            color: "error.contrastText",
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
        data-testid="drop-indicator-after"
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

    <RuntimeProvider
      value={runtimeContextWithNodeRegistration}
    >
      <RuntimeRenderer
        block={block}
        device={device}
      >
        {recursiveChildren}
      </RuntimeRenderer>
    </RuntimeProvider>

  </div>
);
};

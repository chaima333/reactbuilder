import React from "react";
import { Box } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import { useDroppable, useDraggable } from "@dnd-kit/core";
import { Block } from "../../types/page.types";

interface Props {
  block: Block;
  hoveredId?: string | null;
  registry: Record<string, any>;
  device?: "desktop" | "tablet" | "mobile";
  preview?: boolean;
  onUpdate?: (id: string, data: any) => void;
  onDelete?: (id: string) => void;
  onDuplicate?: (id: string) => void;
  onSelect?: (id: string) => void;
  selectedId?: string | null;
  activeId?: string | null;
  hoverData?: {
    overId: string | null;
    dropPosition: string | null;
    isAllowed?: boolean;
  };
}

export const BlockRenderer = ({
  block,
  registry,
  device = "desktop",
  preview = false,
  onUpdate,
onDelete,
onDuplicate,
onSelect,
  selectedId,
  activeId,
  hoverData,
  hoveredId,
}: Props) => {
  const config = registry[block.type];
  
  if (!config) {
    return (
      <Box sx={{ p: 2, color: "red" }}>
        Unknown block: {block.type}
      </Box>
    );
  }

  const Component = config.component;
  const isContainer = config.isContainer;

  // =========================
  // DND HOOKS
  // =========================
  const { setNodeRef } = useDroppable({
    id: block.id,
    data: {
      type: block.type,
      isContainer,
    },
  });

  const {
    attributes,
    listeners,
    setNodeRef: setDragRef,
  } = useDraggable({
    id: block.id,
    data: {
      type: block.type,
      isNew: false,
    },
  });

  // =========================
  // STATES
  // =========================
  const isOver = hoverData?.overId === block.id;
  const dropPos = hoverData?.dropPosition;
  const isAllowed = hoverData?.isAllowed ?? true;
  const isDragging = activeId === block.id;
  const isSelected = selectedId === block.id;

  const feedbackColor = isAllowed ? "#4caf50" : "#f44336";
  const indicatorColor = isAllowed ? "#1976d2" : "#f44336";

  // =========================
  // CHILDREN RECURSION
  // =========================
  const children = isContainer
    ? block.children?.map((child) => (
       <BlockRenderer
  key={child.id}
  block={child}
  registry={registry}
  device={device}
  preview={preview}
  onUpdate={onUpdate}
  onDelete={onDelete}
  onDuplicate={onDuplicate}
  onSelect={onSelect}
  selectedId={selectedId}
  activeId={activeId}
  hoverData={hoverData}
  hoveredId={hoveredId}
/>
      ))
    : null;

    console.log({
  hoveredId,
  blockId:
    block.id,
  isHovered:
    hoveredId ===
    block.id
});
const isHovered =
  hoveredId ===
  block.id;
  return (
    <Box
  ref={(node: HTMLElement | null) => {
    setNodeRef(node);
    setDragRef(node);
  }}
      id={block.id}
      onClick={(e) => {
        e.stopPropagation();
        if (!preview) {
          onSelect?.(block.id);
        }
      }}
      sx={{
        position: "relative",
         pointerEvents: "auto",
         outline:isHovered  ? "3px solid #00bcd4": isOver &&  dropPos === "inside"? `2px solid ${feedbackColor}` : "none",
        transition: "all 0.2s ease",
        opacity: isDragging ? 0.3 : 1,
        filter: isDragging ? "grayscale(1)" : "none",
        zIndex: isSelected ? 10 : 1,
        outlineOffset: "-2px",
        border: !preview && isSelected ? "2px solid #1976d2" : "1px solid transparent",
        "&:hover": {
          border: !preview && !isSelected && !isDragging ? "2px dashed #1976d2" : undefined,
        },
        cursor: isDragging ? "grabbing" : preview ? "default" : "pointer",
      }}
    >
      {/* 🛑 DELETE BUTTON SECTION - FIXED LOGIC */}
     {!preview && isSelected && (

  <Box
    sx={{

      position:
        "absolute",

      top: 8,

      right: 8,

      zIndex: 9999,

      display: "flex",

      alignItems:
        "center",

      gap: 1,
    }}
  >

    {/* ===================== */}
    {/* DRAG HANDLE */}
    {/* ===================== */}
<Box

  {...listeners}
  {...attributes}

  sx={{

    width: 32,

    height: 32,

    borderRadius:
      "6px",

    bgcolor:
      "#222",

    color:
      "#fff",

    display:
      "flex",

    alignItems:
      "center",

    justifyContent:
      "center",

    cursor:
      "grab",

    fontSize:
      "18px",

    userSelect:
      "none",

    "&:hover": {
      opacity: 0.85,
    },
  }}
>
  ⋮⋮
</Box>

    {/* ===================== */}
    {/* DUPLICATE */}
    {/* ===================== */}

    <Box

      onPointerDown={(e) => {

        e.preventDefault();

        e.stopPropagation();
      }}

      onClick={(e) => {

        e.preventDefault();

        e.stopPropagation();

        onDuplicate?.(
          block.id
        );
      }}

      sx={{

        width: 32,

        height: 32,

        borderRadius:
          "6px",

        bgcolor:
          "#1976d2",

        color:
          "#fff",

        display:
          "flex",

        alignItems:
          "center",

        justifyContent:
          "center",

        cursor:
          "pointer",

        "&:hover": {
          opacity: 0.85,
        },
      }}
    >

      📄

    </Box>

    {/* ===================== */}
    {/* DELETE */}
    {/* ===================== */}

    <Box

      onPointerDown={(e) => {

        e.preventDefault();

        e.stopPropagation();
      }}

      onClick={(e) => {

        e.preventDefault();

        e.stopPropagation();

        onDelete?.(
          block.id
        );
      }}

      sx={{

        width: 32,

        height: 32,

        borderRadius:
          "6px",

        bgcolor:
          "#f44336",

        color:
          "#fff",

        display:
          "flex",

        alignItems:
          "center",

        justifyContent:
          "center",

        cursor:
          "pointer",

        "&:hover": {
          opacity: 0.85,
        },
      }}
    >

      🗑️

    </Box>

  </Box>
)}

      {/* EDITOR OVERLAY - PREVENTS INTERNAL CLICKS WHILE EDITING */}
      {!preview && (
        <Box
          sx={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 0,
            backgroundColor: "transparent",
            pointerEvents: "none",
          }}
        />
      )}

      {/* BEFORE INDICATOR */}
      {isOver && dropPos === "before" && (
        <Box
          sx={{
            position: "absolute",
            top: -2,
            left: 0,
            right: 0,
            height: 4,
            bgcolor: indicatorColor,
            zIndex: 20,
          }}
        />
      )}

      {/* ACTUAL COMPONENT */}
      <Component data={block.data} device={device}>
        {children}
      </Component>

      {/* AFTER INDICATOR */}
      {isOver && dropPos === "after" && (
        <Box
          sx={{
            position: "absolute",
            bottom: -2,
            left: 0,
            right: 0,
            height: 4,
            bgcolor: indicatorColor,
            zIndex: 20,
          }}
        />
      )}
    </Box>
  );
};
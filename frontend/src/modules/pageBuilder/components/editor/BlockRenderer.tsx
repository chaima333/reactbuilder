import React from "react";
import { Box } from "@mui/material";
import { useDroppable, useDraggable } from "@dnd-kit/core";
import { Block, ValidationError } from "../../types/page.types";

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
  onHoverChange?: (id: string | null) => void; // Prop مهمة للـ Hover
  selectedId?: string | null;
  activeId?: string | null;
  errors: ValidationError[];
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
  onHoverChange,
  selectedId,
  activeId,
  hoverData,
  hoveredId,
  errors,
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
  const isHovered = hoveredId === block.id;

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
          onHoverChange={onHoverChange}
          selectedId={selectedId}
          activeId={activeId}
          hoverData={hoverData}
          hoveredId={hoveredId}
          errors={errors}
        />
      ))
    : null;

  // Debugging console as requested
  console.log({
    hoveredId,
    blockId: block.id,
    isHovered: hoveredId === block.id
  });

  return (
    <Box
      ref={(node: HTMLElement | null) => {
        setNodeRef(node);
        setDragRef(node);
      }}
      id={block.id}
      // 🔥 تفعيل الـ Hover Logic
      onMouseEnter={(e) => {
        e.stopPropagation();
        if (!preview) onHoverChange?.(block.id);
      }}
      onMouseLeave={(e) => {
        e.stopPropagation();
        if (!preview) onHoverChange?.(null);
      }}
      onClick={(e) => {
        e.stopPropagation();
        if (!preview) {
          onSelect?.(block.id);
        }
      }}
      sx={{
        position: "relative",
        pointerEvents: "auto",
        // Outline Logic
        outline: isHovered 
          ? "3px solid #00bcd4" 
          : isOver && dropPos === "inside" 
            ? `2px solid ${feedbackColor}` 
            : "none",
        
        transition: "all 0.2s ease",
        opacity: isDragging ? 0.3 : 1,
        filter: isDragging ? "grayscale(1)" : "none",
        zIndex: isSelected || isHovered ? 10 : 1,
        outlineOffset: "-2px",
        
        // Selection Border
        border: !preview && isSelected 
          ? "2px solid #1976d2" 
          : "1px solid transparent",
        
        "&:hover": {
          border: !preview && !isSelected && !isDragging 
            ? "2px dashed #1976d2" 
            : undefined,
        },
        cursor: isDragging ? "grabbing" : preview ? "default" : "pointer",
      }}
    >
      {/* 🛑 DELETE / ACTIONS TOOLBAR */}
      {!preview && isSelected && (
        <Box
          sx={{
            position: "absolute",
            top: -36, // نطلعوها الفوق باش ما تغطيش الـ Flex
            right: 0,
            zIndex: 9999,
            display: "flex",
            alignItems: "center",
            gap: 1,
            backgroundColor: "#fff",
            padding: "4px",
            borderRadius: "6px 6px 0 0",
            boxShadow: "0 -2px 10px rgba(0,0,0,0.1)"
          }}
        >
          {/* DRAG HANDLE */}
          <Box
            {...listeners}
            {...attributes}
            sx={{
              width: 32, height: 32, borderRadius: "6px",
              bgcolor: "#222", color: "#fff",
              display: "flex", alignItems: "center", justifyContent: "center",
              cursor: "grab", fontSize: "18px", userSelect: "none",
              "&:hover": { opacity: 0.85 }
            }}
          >
            ⋮⋮
          </Box>

          {/* DUPLICATE */}
          <Box
            onPointerDown={(e) => { e.preventDefault(); e.stopPropagation(); }}
            onClick={(e) => {
              e.preventDefault(); e.stopPropagation();
              onDuplicate?.(block.id);
            }}
            sx={{
              width: 32, height: 32, borderRadius: "6px",
              bgcolor: "#1976d2", color: "#fff",
              display: "flex", alignItems: "center", justifyContent: "center",
              cursor: "pointer", "&:hover": { opacity: 0.85 }
            }}
          >
            📄
          </Box>

          {/* DELETE */}
          <Box
            onPointerDown={(e) => { e.preventDefault(); e.stopPropagation(); }}
            onClick={(e) => {
              e.preventDefault(); e.stopPropagation();
              onDelete?.(block.id);
            }}
            sx={{
              width: 32, height: 32, borderRadius: "6px",
              bgcolor: "#f44336", color: "#fff",
              display: "flex", alignItems: "center", justifyContent: "center",
              cursor: "pointer", "&:hover": { opacity: 0.85 }
            }}
          >
            🗑️
          </Box>
        </Box>
      )}

      {/* EDITOR OVERLAY */}
      {!preview && (
        <Box
          sx={{
            position: "absolute",
            top: 0, left: 0, right: 0, bottom: 0,
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
            top: -2, left: 0, right: 0, height: 4,
            bgcolor: indicatorColor, zIndex: 20,
          }}
        />
      )}

      {/* ACTUAL COMPONENT */}
  <Component
  block={block}
  data={block.data}
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
>
  {children}
</Component>
      {/* AFTER INDICATOR */}
      {isOver && dropPos === "after" && (
        <Box
          sx={{
            position: "absolute",
            bottom: -2, left: 0, right: 0, height: 4,
            bgcolor: indicatorColor, zIndex: 20,
          }}
        />
      )}
    </Box>
  );
};
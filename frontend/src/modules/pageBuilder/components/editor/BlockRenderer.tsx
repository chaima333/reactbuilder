import React from "react";
import { Box } from "@mui/material";
import { Block } from "../../types/page.types";

interface Props {
  block: Block;
  registry: Record<string, any>;
  device?: string;
  preview?: boolean;
  onUpdate?: (id: string, data: any) => void;
  onDelete?: (id: string) => void;
  onSelect?: (id: string) => void;
  selectedId?: string | null;
  activeId?: string | null; // 🆕 باش نعرفو أنهي بلوك قاعدين نجروا فيه توّة
  hoverData?: { 
    overId: string | null; 
    dropPosition: string | null;
    isAllowed?: boolean; // 🆕 باش نفيقوا بالـ Forbidden zone
  };
}

export const BlockRenderer = ({
  block,
  registry,
  device = "desktop",
  preview,
  onUpdate,
  onDelete,
  onSelect,
  selectedId,
  activeId,
  hoverData
}: Props) => {
  const config = registry[block.type];
  if (!config) return <div>Unknown block: {block.type}</div>;

  const Component = config.component;
  const isContainer = config.isContainer;
  
  const isOver = hoverData?.overId === block.id;
  const dropPos = hoverData?.dropPosition;
  const isAllowed = hoverData?.isAllowed ?? true; // لو مش موجودة نعتبروها مسموحة
  const isDragging = activeId === block.id; // هل هذا هو البلوك المهزوز؟

  const children = isContainer
    ? block.children?.map(child => (
        <BlockRenderer
          key={child.id}
          block={child}
          registry={registry}
          device={device}
          preview={preview}
          onUpdate={onUpdate}
          onDelete={onDelete}
          onSelect={onSelect}
          selectedId={selectedId}
          activeId={activeId}
          hoverData={hoverData}
        />
      ))
    : null;

  // تحديد ألوان الـ Feedback بناءً على الـ Validation
  const feedbackColor = isAllowed ? "#4caf50" : "#f44336"; // أخضر للمسموح، أحمر للممنوع
  const indicatorColor = isAllowed ? "#1976d2" : "#f44336"; // أزرق للتموضع، أحمر للممنوع

  return (
    <Box
      id={block.id}
      onClick={(e) => {
        e.stopPropagation();
        onSelect?.(block.id);
      }}
      sx={{
        position: "relative",
        transition: "all 0.2s ease",
        
        // 1. إخفاء البلوك الأصلي وقت الـ Drag (Ghost Effect)
        opacity: isDragging ? 0.3 : 1,
        filter: isDragging ? "grayscale(1)" : "none",

        // 2. Highlight لو باش نسيبو "Inside" (أخضر أو أحمر)
        outline: isOver && dropPos === "inside" ? `2px solid ${feedbackColor}` : "none",
        outlineOffset: "-2px",
        
        // 3. خلفية حمراء خفيفة لو المكان ممنوع
        backgroundColor: isOver && !isAllowed ? "rgba(244, 67, 54, 0.05)" : "transparent",

        // 4. Border الـ Selection العادي
        border: selectedId === block.id ? "2px solid #1976d2" : "1px solid transparent",
        "&:hover": { 
            border: !preview && !selectedId && !isDragging ? "1px dashed #ccc" : undefined 
        },
        cursor: isDragging ? "grabbing" : "default",
      }}
    >
      {/* 🔵 Indicator: Before (أزرق أو أحمر) */}
      {isOver && dropPos === "before" && (
        <Box 
          sx={{ 
            position: "absolute", top: -2, left: 0, right: 0, height: 4, 
            bgcolor: indicatorColor, zIndex: 10,
            boxShadow: isAllowed ? "none" : "0 0 8px rgba(244, 67, 54, 0.5)"
          }} 
        />
      )}

      <Component
        data={block.data}
        device={device}
        preview={preview}
        onChange={(data: any) => onUpdate?.(block.id, data)}
        onDelete={() => onDelete?.(block.id)}
      >
        {children}
      </Component>

      {/* 🔵 Indicator: After (أزرق أو أحمر) */}
      {isOver && dropPos === "after" && (
        <Box 
          sx={{ 
            position: "absolute", bottom: -2, left: 0, right: 0, height: 4, 
            bgcolor: indicatorColor, zIndex: 10,
            boxShadow: isAllowed ? "none" : "0 0 8px rgba(244, 67, 54, 0.5)"
          }} 
        />
      )}
    </Box>
  );
};
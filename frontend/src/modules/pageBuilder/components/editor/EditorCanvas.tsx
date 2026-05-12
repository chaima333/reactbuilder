import { Box, Typography } from "@mui/material";
import { BlockRenderer } from "./BlockRenderer";
import { useDroppable } from "@dnd-kit/core";
import { useEffect } from "react";

export const EditorCanvas = ({
  blocks = [], // 👈 ديما حط default value فارغة
  registry,
  onUpdate,
  onDelete,
  onSelect,
  selectedId,
  device,
  activeId,
  hoverData,
  onDuplicate,
  hoveredId,
}: any) => {

  console.log("📥 BLOCKS:", blocks);

  const { setNodeRef, isOver } = useDroppable({
    id: "canvas-root",
    data: { isRoot: true }
});
console.log(
  "EDITOR CANVAS hoveredId:",
  hoveredId
);
  return (
    <Box 
      ref={setNodeRef}
      sx={{ 
        p: 4, 
        minHeight: "100vh",
        backgroundColor: isOver ? "rgba(0, 0, 0, 0.02)" : "#f9f9f9", // feedback عند السحب
        transition: "all 0.2s ease",
        position: "relative"
      }}
    >
      {/* إذا مفيش بلوكات، نوري الـ Placeholder */}
      {(!blocks || blocks.length === 0) ? (
        <Box
          sx={{
            height: "300px",
            border: "2px dashed #ccc",
            borderRadius: 4,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 2,
            opacity: 0.6,
            backgroundColor: isOver ? "rgba(25, 118, 210, 0.05)" : "transparent",
            borderColor: isOver ? "primary.main" : "#ccc",
            "&:hover": { borderColor: "primary.main", bgcolor: "rgba(0,0,0,0.02)" }
          }}
        >
          <Typography variant="h6" color={isOver ? "primary.main" : "text.secondary"}>
            {isOver ? "أفلت المكون هنا" : "لوحة العمل فارغة"}
          </Typography>
          <Typography variant="body2" color="text.disabled">
            اسحب المكونات من القائمة اليسرى وضعها هنا
          </Typography>
        </Box>
      ) : (
        // رسم البلوكات
        blocks.map((block: any) => (
          <BlockRenderer
            key={block.id}
            block={block}
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
          />
        ))
      )}
    </Box>
  );
};
import React from "react";
import { useDroppable } from "@dnd-kit/core";
import { useResolvedStyle } from "../../../../core/theme/useResolvedStyle";

export const FlexBlock = ({ block, data, children, device = "desktop" }: any) => {
  const source = data || block?.data;
  const resolved = useResolvedStyle((source?.style || {}) as any, device);
  
  const { setNodeRef, isOver } = useDroppable({
    id: block?.id,
    data: { type: "flex", blockId: block?.id }
  });

  const flexStyle: React.CSSProperties = {
    display: "flex",
    flexDirection: device === "mobile" ? "column" : "row",
    flexWrap: "wrap", // 💡 هذا اللي يخلي العناصر تنزل للسطر الموالي
    gap: resolved.gap || "24px",
    width: "100%",
    padding: "20px",
    boxSizing: "border-box",
    background: isOver ? "#eff6ff" : "#fafafa",
    border: isOver ? "2px solid #3b82f6" : "1px dashed #d1d5db",
    borderRadius: "14px"
  };

  return (
    <div 
      ref={setNodeRef} 
      id={`pb-runtime-${block?.id}`} 
      style={flexStyle} 
      className="pb-flex-container" 
      data-droppable-container="true"
      data-block-type="flex"
    >
      {children}
      {(!block?.children || block.children.length === 0) && (
        <div style={{ width: "100%", padding: "20px", textAlign: "center", color: "#6b7280" }}>
          {isOver ? "✨ Drop here!" : "Flex Layout (Empty)"}
        </div>
      )}
    </div>
  );
};

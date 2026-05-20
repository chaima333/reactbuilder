import React from "react";
import { useDroppable } from "@dnd-kit/core";

export const FlexItemBlock = ({
  block,
  children,
  device = "desktop"
}: any) => {
  const { setNodeRef, isOver } = useDroppable({
    id: block?.id,
    data: { type: "flexItem", blockId: block?.id }
  });

  const getWidth = () => {
    if (device === "mobile") return "100%";
    if (device === "tablet") return "calc(50% - 12px)";
    return "calc(25% - 18px)";
  };

  const itemStyle: React.CSSProperties = {
    display: "flex",
    flexDirection: "column",
    flex: `0 0 ${getWidth()}`,
    maxWidth: getWidth(),
    minHeight: "120px",
    boxSizing: "border-box",
    backgroundColor: "#fff",
    border: isOver ? "2px solid #3b82f6" : "1px solid #e5e7eb",
    borderRadius: "12px",
    padding: "16px",
    overflow: "visible",
    pointerEvents: "auto",
    position: "relative"
  };

  return (
    <div
      ref={setNodeRef}
      data-droppable-container="true"
      data-block-type="flexItem"
      id={`pb-runtime-${block?.id}`}
      style={itemStyle}
      className="pb-flex-item"
    >
      {children}
    </div>
  );
};

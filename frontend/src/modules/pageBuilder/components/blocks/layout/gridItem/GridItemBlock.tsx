import React from "react";
import { useDroppable } from "@dnd-kit/core";
import { useResolvedStyle } from "../../../../core/theme/useResolvedStyle";

export const GridItemBlock = ({
  block,
  data,
  children,
  device = "desktop"
}: any) => {
  const source = data || block?.data;
  const resolved = useResolvedStyle((source?.style || {}) as any, device);

  const { setNodeRef, isOver } = useDroppable({
    id: block?.id,
    data: {
      type: "gridItem",
      blockId: block?.id
    }
  });

  const hasChildren = (block?.children?.length || 0) > 0;

  const outerStyle: React.CSSProperties = {
    width: "100%",
    minWidth: 0,
    overflow: "visible",
    display: "flex",
    flexDirection: "column",
    height: "100%",
    gridColumn:
      device === "mobile"
        ? "span 1"
        : device === "tablet"
        ? "span 1"
        : resolved.gridColumn || "auto",
    gridRow: resolved.gridRow || "auto",
    boxSizing: "border-box",
    backgroundColor: resolved.backgroundColor || "#ffffff",
    borderRadius: resolved.borderRadius || "16px",
    border: isOver ? "2px solid #3b82f6" : "1px solid #e5e7eb",
    position: "relative",
    transition: "all 0.15s ease-in-out",
    pointerEvents: "auto"
  };

  const innerFlexStyle: React.CSSProperties = {
    display: "flex",
    flexDirection: "column",
    flex: 1,
    justifyContent: "flex-start",
    alignItems: "stretch",
    gap: resolved.gap || "16px",
    paddingTop: resolved.paddingTop || "20px",
    paddingBottom: resolved.paddingBottom || "20px",
    paddingLeft: resolved.paddingLeft || "20px",
    paddingRight: resolved.paddingRight || "20px",
    width: "100%",
    height: "100%",
    boxSizing: "border-box",
    pointerEvents: "auto"
  };

  return (
    <div
      ref={setNodeRef}
      data-droppable-container="true"
      data-block-type="gridItem"
      id={`pb-runtime-${block?.id}`}
      className="pb-grid-item"
      style={outerStyle}
    >
      <div style={innerFlexStyle}>
        {children}

        {!hasChildren && (
          <div
            style={{
              pointerEvents: "none",
              border: "2px dashed #ccc",
              borderRadius: "12px",
              padding: "40px 20px",
              textAlign: "center",
              color: isOver ? "#2563eb" : "#999",
              minHeight: "120px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: isOver ? "#eff6ff" : "#fafafa",
              width: "100%",
              boxSizing: "border-box"
            }}
          >
            Drop blocks here (Grid Item)
          </div>
        )}
      </div>
    </div>
  );
};

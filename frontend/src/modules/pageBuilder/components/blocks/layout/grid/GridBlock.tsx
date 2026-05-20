import React from "react";
import { useResolvedStyle } from "../../../../core/theme/useResolvedStyle";
import { useDroppable } from "@dnd-kit/core";

type Device =
  | "desktop"
  | "tablet"
  | "mobile";

interface GridBlockProps {
  block?: any;
  data?: any;
  children?: React.ReactNode;
  device?: Device;
}

export const GridBlock = ({
  block,
  data,
  children,
  device = "desktop"
}: GridBlockProps) => {

  const source =
    data || block?.data;

  const resolved =
    useResolvedStyle(
      (source?.style || {}) as any,
      device
    );

  const {
    setNodeRef,
    isOver
  } = useDroppable({
    id:
      block?.id ||
      "grid-container",

    data: {
      type: "grid",
      blockId: block?.id
    }
  });

  const columns =
    device === "mobile"
      ? 1
      : device === "tablet"
      ? 2
      : source?.style?.desktop?.columns || 4;
      
   const hasChildren =
  (block?.children?.length || 0) > 0;

  const gridStyle: React.CSSProperties = {

    display: "grid",

    pointerEvents: "auto",
    overflow: "visible",
    gridTemplateColumns:
    device === "mobile"
    ? "1fr"
    : `repeat(${columns}, minmax(0, 1fr))`,

    gridAutoRows:
      "minmax(120px, auto)",

    alignItems: "start",

    gap:
      resolved.gap || "24px",

    width: "100%",

    minWidth: 0,

    minHeight: "180px",

    padding: "20px",

    boxSizing: "border-box",

    position: "relative",

    borderRadius: "14px",

    border:
      isOver
        ? "2px solid #3b82f6"
        : "1px dashed #d1d5db",

    background:
      isOver
        ? "#eff6ff"
        : "#fafafa",

    boxShadow:
      isOver
        ? "0 0 0 4px rgba(59,130,246,0.08)"
        : "0 1px 2px rgba(0,0,0,0.04)",

    transition:
      "all 0.15s ease-in-out"
  };

  return (
    <div
      ref={setNodeRef}
      data-droppable-container="true"
      data-block-type="grid"
      id={
        block?.id
          ? `pb-runtime-${block.id}`
          : undefined
      }
      style={gridStyle}
      className="pb-grid-container"
    >

      {!hasChildren && (
        <div
          style={{
            gridColumn: `span ${columns}`,
             pointerEvents: "none",
            minHeight: "100px",

            display: "flex",
            alignItems: "center",
            justifyContent: "center",

            borderRadius: "10px",

            background:
              isOver
                ? "rgba(59,130,246,0.08)"
                : "rgba(0,0,0,0.02)",

            color:
              isOver
                ? "#2563eb"
                : "#6b7280",

            fontSize: "14px",

            fontWeight: 500,

            transition:
              "all 0.15s ease-in-out"
          }}
        >
          {isOver
            ? "✨ Drop inside Grid Layout"
            : "Grid Layout"}
        </div>
      )}

      {children}
    </div>
  );
};

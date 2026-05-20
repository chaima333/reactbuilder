import React from "react";
import { useDroppable } from "@dnd-kit/core";
import { SectionShell } from "../../semantic/shared/SectionShell";

type Device = "desktop" | "tablet" | "mobile";

interface SectionBlockProps {
  block?: any;
  children?: React.ReactNode;
  data: any;
  device?: Device;
}

export const SectionBlock = ({
  block,
  children,
  data,
  device = "desktop"
}: SectionBlockProps) => {
  const hasChildren =
    React.Children.count(children) > 0;

  const { setNodeRef, isOver } = useDroppable({
    id: block?.id,
    data: {
      type: "section",
      blockId: block?.id
    }
  });

  return (
    <div
      ref={setNodeRef}
      id={`pb-runtime-${block.id}`}
      data-droppable-container="true"
      data-block-type="section"
      className="pb-section"
      style={{
        width: "100%",
        position: "relative",
        pointerEvents: "auto",
        marginBottom: "24px"
      }}
    >
      <SectionShell
        style={{
          ...(data?.style || {}),
          minHeight: "200px",
          transition: "all 0.15s ease-in-out"
        }}
        device={device}
      >
        {children}

        {!hasChildren && (
          <div
            style={{
              width: "100%",
              minHeight: "250px",
              border: isOver
                ? "2px dashed #3b82f6"
                : "1px dashed #d1d5db",
              borderRadius: "12px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: isOver ? "#2563eb" : "#6b7280",
              fontSize: "14px",
              background: isOver ? "#eff6ff" : "#fafafa",
              pointerEvents: "none"
            }}
          >
            Drop blocks here (Section)
          </div>
        )}
      </SectionShell>
    </div>
  );
};

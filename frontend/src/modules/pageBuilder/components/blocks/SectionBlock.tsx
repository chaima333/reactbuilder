import React, { useState, useRef } from "react";
import { Box } from "@mui/material";

export const SectionBlock = ({
  data,
  device,
  preview,
  registry,
  setHoverData,
  hoverData,
  onUpdate,
  context,
}: any) => {
  const columns = data.props?.children || [];
  const containerRef = useRef<HTMLDivElement>(null);

  // --- 📏 Logic Resizing (تحسين العرض المرن) ---
  const startResizing = (index: number, startEvent: React.MouseEvent) => {
    if (preview) return;
    startEvent.preventDefault();
    startEvent.stopPropagation();

    const startX = startEvent.pageX;
    const containerWidth = containerRef.current?.offsetWidth || 1;
    const leftCol = columns[index];
    const rightCol = columns[index + 1];
    
    const startLeftWidth = leftCol.width || (100 / columns.length);
    const startRightWidth = rightCol.width || (100 / columns.length);

    const onMouseMove = (moveEvent: MouseEvent) => {
      const deltaX = moveEvent.pageX - startX;
      const deltaPercent = (deltaX / containerWidth) * 100;

      const newColumns = [...columns];
      if (startLeftWidth + deltaPercent > 10 && startRightWidth - deltaPercent > 10) {
        newColumns[index] = { ...leftCol, width: startLeftWidth + deltaPercent };
        newColumns[index + 1] = { ...rightCol, width: startRightWidth - deltaPercent };

        onUpdate({ 
          ...data, 
          props: { ...data.props, children: newColumns } 
        });
      }
    };

    const onMouseUp = () => {
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);
    };

    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);
  };

  return (
    <Box
      ref={containerRef}
      sx={{
        display: "flex",
        flexDirection: "row",
        width: "100%",
        gap: preview ? data.style?.[device]?.gap || "0px" : "4px",
        padding: data.style?.[device]?.padding || "10px",
        backgroundColor: data.style?.[device]?.backgroundColor || "transparent",
        minHeight: "100px",
        position: "relative",
        boxSizing: "border-box",
      }}
    >
      {columns.map((col: any, i: number) => {
        // ✨ تحديد هل الماوس فوق هذا العمود بالذات؟
        const isOverThisCol = 
          hoverData?.targetId === data.id && 
          hoverData?.type === "inside" && 
          hoverData?.columnIndex === i;

        return (
          <React.Fragment key={col.id || i}>
            <Box
              onMouseMove={(e) => {
                if (preview || !setHoverData) return;
                e.stopPropagation();
                setHoverData({
                  targetId: data.id,
                  type: "inside",
                  columnIndex: i,
                });
              }}
              sx={{
                width: `${col.width || 100 / columns.length}%`,
                minHeight: 120,
                border: preview ? "none" : (isOverThisCol ? "2px solid #1976d2" : "1px dashed #ccc"),
                backgroundColor: isOverThisCol ? "rgba(25, 118, 210, 0.05)" : "transparent",
                position: "relative",
                transition: "all 0.2s ease",
                borderRadius: "4px",
                display: "flex",
                flexDirection: "column",
                gap: "8px"
              }}
            >
              {/* 📥 Empty State Placeholder */}
              {(!col.blocks || col.blocks.length === 0) && !preview && (
                <Box sx={{
                  position: "absolute", top: "50%", left: "50%",
                  transform: "translate(-50%, -50%)",
                  opacity: 0.4, fontSize: "12px", pointerEvents: "none",
                  textAlign: "center"
                }}>
                  Column {i + 1} <br/> Drop Block Here
                </Box>
              )}

              {/* 🧱 رندرة المكونات (Recursion) */}
              {col.blocks?.map((block: any) => {
                const Config = registry?.[block.type];
                if (!Config) return null;
                const Component = Config.component;

                return (
                  <Component
                    key={block.id}
                    data={block.data || block} // دعم الـ formats المختلفة للبيانات
                    {...context}
                    registry={registry}       // تمرير الـ registry للأسفل (Nesting)
                    device={device}
                    preview={preview}
                    setHoverData={setHoverData}
                    hoverData={hoverData}
                    onUpdate={(newBlockData: any) => {
                      // 🔄 تحديث الـ Block المعين داخل العمود المعين
                      const updatedCols = columns.map((c: any) => {
                        if (c.id !== col.id) return c;
                        return {
                          ...c,
                          blocks: c.blocks.map((b: any) =>
                            b.id === block.id ? { ...b, data: newBlockData } : b
                          ),
                        };
                      });
                      onUpdate({ ...data, props: { ...data.props, children: updatedCols } });
                    }}
                  />
                );
              })}
            </Box>

            {/* ↕️ Resizer Handle */}
            {!preview && i < columns.length - 1 && (
              <Box
                onMouseDown={(e) => startResizing(i, e)}
                sx={{
                  width: "6px",
                  cursor: "col-resize",
                  backgroundColor: "rgba(0,0,0,0.05)",
                  "&:hover": { backgroundColor: "#1976d2" },
                  zIndex: 10,
                  transition: "background 0.3s"
                }}
              />
            )}
          </React.Fragment>
        );
      })}
    </Box>
  );
};
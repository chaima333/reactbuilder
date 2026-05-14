import React from "react";
import { useResolvedStyle } from "../../core/theme/useResolvedStyle";

type Device = "desktop" | "tablet" | "mobile";

export const SectionBlock = ({ children, data, device }: any) => {
  const resolvedStyle = useResolvedStyle(
    data?.style,
    (device || "desktop") as Device
  );

  return (
    <div
      style={{
        width: "100%",
        minHeight: resolvedStyle.minHeight || "120px",
        display: "flex",
        flexDirection: resolvedStyle.flexDirection || "column",
        justifyContent: resolvedStyle.justifyContent || "flex-start",
        alignItems: resolvedStyle.alignItems || "stretch",
        gap: resolvedStyle.gap || "16px",
        paddingTop: resolvedStyle.paddingTop || "40px",
        paddingBottom: resolvedStyle.paddingBottom || "40px",
        backgroundColor: resolvedStyle.backgroundColor || "#ffffff",
        border: resolvedStyle.border || "1px dashed #eee",
        boxSizing: "border-box",
        position: "relative",
      }}
    >
      {children}
      
      {React.Children.count(children) === 0 && (
        <div style={{ color: "#aaa", textAlign: "center", padding: "40px", border: "1px dashed #ccc", margin: "20px" }}>
          Drop blocks here (Section)
        </div>
      )}
    </div>
  );
};
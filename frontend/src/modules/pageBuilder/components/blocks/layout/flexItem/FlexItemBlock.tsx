// src/modules/pageBuilder/components/blocks/layout/flexItem/FlexItemBlock.tsx

import React from "react";

import { useResolvedStyle }
from "../../../../core/theme/useResolvedStyle";

import type {
  BlockComponentProps
} from "../../../../runtime/renderer/EditorBlockRenderer";

type Device =
  | "desktop"
  | "tablet"
  | "mobile";

export const FlexItemBlock = ({
  block,
  children,
  device = "desktop"
}: BlockComponentProps) => {

  const resolved =
    useResolvedStyle(
      block?.data?.style || {},
      device as Device
    );

  const itemStyle:
    React.CSSProperties = {

    // =========================
    // 👑 AUTHORITATIVE WIDTH ENGINE
    // =========================

    width:
      device === "mobile"
        ? "100%"
        : device === "tablet"
        ? "calc(50% - 24px)"
        : "calc(25% - 24px)",

    flexShrink: 0,

    flexGrow: 0,

    // =========================
    // STRUCTURE
    // =========================

    display: "flex",

    flexDirection: "column",

    gap:
      resolved.gap || "16px",

    // =========================
    // VISUAL TOKENS
    // =========================

    backgroundColor:
      resolved.backgroundColor,

    color:
      resolved.color,

    borderRadius:
      resolved.borderRadius || "16px",

    paddingTop:
      resolved.paddingTop,

    paddingBottom:
      resolved.paddingBottom,

    paddingLeft:
      resolved.paddingLeft,

    paddingRight:
      resolved.paddingRight,

    // =========================
    // SAFETY
    // =========================

    overflow: "hidden",

    boxSizing: "border-box",

    minWidth: 0
  };

  return (

    <div
      className="runtime-flex-item"
      style={itemStyle}
    >

      {children}

    </div>
  );
};
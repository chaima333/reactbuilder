import React from "react";

import {
  useResolvedStyle
} from "../../core/theme/useResolvedStyle";

type Device =
  | "desktop"
  | "tablet"
  | "mobile";

type Props = {
  children?: React.ReactNode;
  data: any;
  device?: Device;
  isEditor?: boolean;
};

export const FlexItemBlock = ({
  children,
  data,
  device = "desktop",
  isEditor = true
}: Props) => {

  const style =
    useResolvedStyle(
      data?.style,
      device
    );

  const isMobile =
    device === "mobile";

  const itemStyle:
    React.CSSProperties = {

    // =========================
    // FLEX ENGINE
    // =========================

    flex:
      isMobile
        ? "1 1 100%"
        : (style.flex || "1"),

    minWidth: 0,

    width:
      isMobile
        ? "100%"
        : (
          style.width ||
          "auto"
        ),

    // =========================
    // SPACING
    // =========================

    padding:
      style.padding || "10px",

    boxSizing:
      "border-box",

    // =========================
    // STRUCTURE
    // =========================

    minHeight:
      style.minHeight ||
      "120px",

    display:
      "flex",

    flexDirection:
      "column",

    position:
      "relative",

    overflow:
      "hidden",

    // =========================
    // EDITOR VISUALS
    // =========================

    border:
      isEditor
        ? "1px dashed rgba(0,0,0,0.08)"
        : "none",

    background:
      isEditor
        ? "rgba(0,0,0,0.015)"
        : "transparent",

    transition:
      "all 0.2s ease"
  };

  return (

    <div
      className="flex-item-runtime"
      style={itemStyle}
    >

      {children &&
      React.Children.count(children) > 0
        ? (
          children
        ) : isEditor ? (

          <div
            style={{

              flex: 1,

              display: "flex",

              alignItems: "center",

              justifyContent: "center",

              opacity: 0.3,

              fontSize: "12px",

              pointerEvents: "none"
            }}
          >
            Drop here
          </div>

        ) : null}

    </div>
  );
};
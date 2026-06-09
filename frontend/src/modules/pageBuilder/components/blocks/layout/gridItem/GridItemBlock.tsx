import React from "react";

import {
  useResolvedStyle
} from "../../../../core/theme/useResolvedStyle";

import {
  useRuntimeNode
} from "../../../../hooks/useRuntimeNode";

export const GridItemBlock = ({
  block,
  data,
  children,
  device = "desktop"
}: any) => {

  // =====================================
  // RUNTIME NODE
  // =====================================

  const runtime =
    useRuntimeNode({

      block,

      type: "gridItem",

      droppable: true
    });

  const {
    isOver,
    rootProps
  } = runtime;

  // =====================================
  // SOURCE
  // =====================================

  const source =
  block?.data;

  // =====================================
  // RESOLVED STYLE
  // =====================================
  const resolved =
  
    useResolvedStyle(
      (source?.style || {}) as any,
      device
    );

  // =====================================
  // CHILDREN
  // =====================================

  const hasChildren =

    (block?.children?.length || 0)
    > 0;

  // =====================================
  // OUTER STYLE
  // =====================================

  const outerStyle:
  React.CSSProperties = {

    width:
      "100%",

    minWidth:
      0,

      alignSelf:
  "start",

    minHeight:
      0,

    overflow:
      "hidden",

    boxSizing:
      "border-box",

    display:
      "block",

    gridColumn:

      device === "mobile" ||
      device === "tablet"

        ? "span 1"

        : resolved.gridColumn || "auto",

    gridRow:
      resolved.gridRow || "auto",

    backgroundColor:
      resolved.backgroundColor,

    borderRadius:
      resolved.borderRadius || "16px",

    border:
      isOver

        ? "2px solid #3b82f6"

        : resolved.border,

    position:
      "relative",

    transition:
      "all 0.15s ease-in-out"
  };

  // =====================================
  // INNER STYLE
  // =====================================

const innerStyle:
React.CSSProperties = {

  minWidth:
    0,

  boxSizing:
    "border-box",

  display:
    "flex",

  flexDirection:
    "column",

    width: "100%",
maxWidth: "100%",
overflow: "visible",

  alignItems:
    "stretch",

  justifyContent:
    "flex-start",

  gap:
    resolved.gap || "16px",

  padding:
    resolved.padding,

  paddingTop:
    resolved.paddingTop || "20px",

  paddingRight:
    resolved.paddingRight || "20px",

  paddingBottom:
    resolved.paddingBottom || "20px",

  paddingLeft:
    resolved.paddingLeft || "20px"
};
  // =====================================
  // RENDER
  // =====================================
  return (

    <div
      {...rootProps}

      style={outerStyle}
    >

      <div style={innerStyle}>

        {children}

        {!hasChildren && (

          <div>

            Drop blocks here
            (Grid Item)

          </div>
        )}

      </div>

    </div>
  );
};
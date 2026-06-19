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
  const resolved: any =
  
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

  alignSelf: resolved.alignSelf || "stretch",
justifySelf: resolved.justifySelf || "stretch",

    minHeight:
      0,

    overflow:
      resolved.overflow || "visible",

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

boxShadow:
  resolved.boxShadow,

  background:
  resolved.background ||
  resolved.backgroundColor,

borderRadius:
  resolved.borderRadius,

border: resolved.border,

color:
  resolved.color,
    
    position:
      "relative",

    transition:
      "all 0.15s ease-in-out"
  };

  // =====================================
  // INNER STYLE
  // =====================================

const isImportedLayout =
  resolved.display === "grid" ||
  resolved.display === "flex" ||
  !!resolved.gridTemplateColumns;

const innerStyle: React.CSSProperties = {
  minWidth: 0,
  boxSizing: "border-box",

  display:
    isImportedLayout
      ? resolved.display || "grid"
      : "flex",

  flexDirection:
    isImportedLayout
      ? resolved.flexDirection
      : "column",

  gridTemplateColumns:
    resolved.gridTemplateColumns,

  gap:
    resolved.gap || "16px",

  width: "100%",
  maxWidth: "100%",
  overflow: "visible",

  alignItems:
    resolved.alignItems ||
    (isImportedLayout ? "center" : "stretch"),

justifyContent:
  resolved.justifyContent || "center",

  padding:
    resolved.padding,

  paddingTop:
    resolved.paddingTop || (isImportedLayout ? undefined : "20px"),

  paddingRight:
    resolved.paddingRight || (isImportedLayout ? undefined : "20px"),

  paddingBottom:
    resolved.paddingBottom || (isImportedLayout ? undefined : "20px"),

  paddingLeft:
    resolved.paddingLeft || (isImportedLayout ? undefined : "20px")
};
  // =====================================
  // RENDER
  // =====================================

  console.log(
  "GRID_ITEM_OUTER_STYLE",
  outerStyle
);
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

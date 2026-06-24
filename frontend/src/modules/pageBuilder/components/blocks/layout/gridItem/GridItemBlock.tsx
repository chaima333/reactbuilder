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

  const outerStyle: React.CSSProperties = {
  width: "100%",
  minWidth: 0,
  maxWidth: "100%",
  minHeight: 0,
  alignSelf: resolved.alignSelf || "stretch",
  justifySelf: resolved.justifySelf || "stretch",
  overflow: "visible",
  boxSizing: "border-box",
  display: "block",
  gridColumn:
    device === "mobile" || device === "tablet"
      ? "span 1"
      : resolved.gridColumn || "auto",
  gridRow: resolved.gridRow || "auto",
  position: "relative",
  transition: "all 0.15s ease-in-out"
};

  // =====================================
  // INNER STYLE
  // =====================================

const isImportedLayout =
  resolved.display === "grid" ||
  resolved.display === "flex" ||
  !!resolved.gridTemplateColumns;

  const shouldPreserveImportedLayout =
  resolved.display === "grid" ||
  resolved.display === "flex";

const innerStyle: React.CSSProperties = {
  minWidth: 0,
  maxWidth: "100%",
  boxSizing: "border-box",

  display:
    shouldPreserveImportedLayout
      ? resolved.display
      : "block",

  flexDirection:
    shouldPreserveImportedLayout
      ? resolved.flexDirection
      : undefined,

  gridTemplateColumns:
    shouldPreserveImportedLayout
      ? resolved.gridTemplateColumns
      : undefined,

  gap:
    shouldPreserveImportedLayout
      ? resolved.gap
      : undefined,

  width: "100%",
  overflow: "hidden",

  alignItems:
    shouldPreserveImportedLayout
      ? resolved.alignItems
      : undefined,

  justifyContent:
    shouldPreserveImportedLayout
      ? resolved.justifyContent
      : undefined,

  padding: resolved.padding,
  paddingTop: resolved.paddingTop,
  paddingRight: resolved.paddingRight,
  paddingBottom: resolved.paddingBottom,
  paddingLeft: resolved.paddingLeft
};
 
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

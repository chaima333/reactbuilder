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
    context,
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
  width: resolved.width || "100%",
  minWidth: 0,
  maxWidth: resolved.maxWidth || "100%",
  height: resolved.height,
  minHeight: resolved.minHeight || 0,

  alignSelf: resolved.alignSelf || "stretch",
  justifySelf: resolved.justifySelf || "stretch",

  overflow: "visible",
  boxSizing: "border-box",

  display:
    resolved.display === "grid" || resolved.display === "flex"
      ? resolved.display
      : "block",

  flexDirection: resolved.flexDirection,
  alignItems: resolved.alignItems,
  justifyContent: resolved.justifyContent,
  gap: resolved.gap,

  gridColumn:
    device === "mobile" || device === "tablet"
      ? "span 1"
      : resolved.gridColumn || "auto",
  gridRow: resolved.gridRow || "auto",

  padding: resolved.padding,
  paddingTop: resolved.paddingTop,
  paddingRight: resolved.paddingRight,
  paddingBottom: resolved.paddingBottom,
  paddingLeft: resolved.paddingLeft,

  background: resolved.background || resolved.backgroundColor,
  border: resolved.border,
  borderRadius: resolved.borderRadius,
  boxShadow: resolved.boxShadow,
  color: resolved.color,
  textAlign: resolved.textAlign,

  position: "relative",
  transition: "all 0.15s ease-in-out"
};

  // =====================================
  // INNER STYLE
  // =====================================

  const shouldPreserveImportedLayout =
  resolved.display === "grid" ||
  resolved.display === "flex";

const shouldFlowEditorCardContent =
  context.mode === "editor" &&
  !shouldPreserveImportedLayout;

const flowGap =
  resolved.rowGap ||
  resolved.gap;

const innerStyle: React.CSSProperties = {
  minWidth: 0,
  maxWidth: "100%",
  boxSizing: "border-box",

  display: "contents",

  width: "100%",
  height: "100%",

  overflow: "visible"
};
 
  return (

    <div
      {...rootProps}

      style={outerStyle}
    >

      <div
        className={
          shouldFlowEditorCardContent
            ? "pb-grid-item-flow"
            : undefined
        }
        style={innerStyle}
      >

        {shouldFlowEditorCardContent && (

          <style>
            {`
              .pb-gridItem > .pb-grid-item-flow .editor-wrapper {
                min-width: 0 !important;
              }

              .pb-gridItem > .pb-grid-item-flow .editor-wrapper[data-editor-block-type="title"],
              .pb-gridItem > .pb-grid-item-flow .editor-wrapper[data-editor-block-type="text"] {
                display: block !important;
                width: 100% !important;
                max-width: 100% !important;
                min-width: 0 !important;
                flex: 0 0 auto !important;
              }

              .pb-gridItem > .pb-grid-item-flow .editor-wrapper[data-editor-block-type="title"] > *,
              .pb-gridItem > .pb-grid-item-flow .editor-wrapper[data-editor-block-type="text"] > * {
                position: static !important;
                top: auto !important;
                right: auto !important;
                bottom: auto !important;
                left: auto !important;
                height: auto !important;
                min-height: 0 !important;
                max-height: none !important;
                transform: none !important;
              }
            `}
          </style>
        )}

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

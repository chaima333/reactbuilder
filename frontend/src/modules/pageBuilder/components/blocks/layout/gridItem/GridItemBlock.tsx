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

    React.Children.count(children) > 0 ||
    (block?.children?.length || 0) > 0;

  const isEditorEmpty =
    context.mode === "editor" &&
    !hasChildren;

  // =====================================
  // OUTER STYLE
  // =====================================

 const outerStyle: React.CSSProperties = {
  width: resolved.width || "100%",
  minWidth: 0,
  maxWidth: resolved.maxWidth || "100%",
  height: resolved.height,
  minHeight:
    isEditorEmpty
      ? resolved.minHeight || "96px"
      : resolved.minHeight || 0,

  alignSelf: resolved.alignSelf || "stretch",
  justifySelf: resolved.justifySelf || "stretch",

  overflow: "visible",
  boxSizing: "border-box",

  display:
    isEditorEmpty
      ? resolved.display || "flex"
      : resolved.display === "grid" || resolved.display === "flex"
        ? resolved.display
        : "block",

  flexDirection: resolved.flexDirection,
  alignItems:
    isEditorEmpty
      ? resolved.alignItems || "center"
      : resolved.alignItems,
  justifyContent:
    isEditorEmpty
      ? resolved.justifyContent || "center"
      : resolved.justifyContent,
  gap: resolved.gap,

  gridColumn:
    device === "mobile" || device === "tablet"
      ? "span 1"
      : resolved.gridColumn || "auto",
  gridRow: resolved.gridRow || "auto",

  padding:
    isEditorEmpty
      ? resolved.padding || "16px"
      : resolved.padding,
  paddingTop:
    isEditorEmpty
      ? resolved.paddingTop || resolved.padding || "16px"
      : resolved.paddingTop,
  paddingRight:
    isEditorEmpty
      ? resolved.paddingRight || resolved.padding || "16px"
      : resolved.paddingRight,
  paddingBottom:
    isEditorEmpty
      ? resolved.paddingBottom || resolved.padding || "16px"
      : resolved.paddingBottom,
  paddingLeft:
    isEditorEmpty
      ? resolved.paddingLeft || resolved.padding || "16px"
      : resolved.paddingLeft,

  background:
    isEditorEmpty
      ? resolved.background ||
        resolved.backgroundColor ||
        "var(--mui-palette-action-hover, rgba(25, 118, 210, 0.06))"
      : resolved.background || resolved.backgroundColor,
  border:
    isEditorEmpty
      ? resolved.border ||
        "1px dashed var(--mui-palette-divider, rgba(25, 118, 210, 0.4))"
      : resolved.border,
  borderRadius: resolved.borderRadius,
  boxShadow: resolved.boxShadow,
  color:
    isEditorEmpty
      ? resolved.color ||
        "var(--mui-palette-text-secondary, rgba(0, 0, 0, 0.6))"
      : resolved.color,
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

      {isEditorEmpty ? (

        "Drop blocks here (Grid Item)"

      ) : (

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

        </div>

      )}

    </div>
  );
};

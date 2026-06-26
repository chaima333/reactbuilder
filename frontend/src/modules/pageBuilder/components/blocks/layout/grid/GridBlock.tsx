import React, {
  useEffect,
  useRef
} from "react";

import {
  useResolvedStyle
} from "../../../../core/theme/useResolvedStyle";

import {
  useRuntimeNode
} from "../../../../hooks/useRuntimeNode";

type Device =
  | "desktop"
  | "tablet"
  | "mobile";

interface GridBlockProps {

  block?: any;

  data?: any;

  children?: React.ReactNode;

  device?: Device;
}

const findSemanticType = (
  block: any
): string | null => {
  if (!block) {
    return null;
  }

  const semanticType =
    block?.meta?.semanticType ||
    block?.data?.meta?.semanticType;

  if (semanticType) {
    return semanticType;
  }

  for (
    const child of block.children || []
  ) {
    const childSemantic =
      findSemanticType(
        child
      );

    if (childSemantic) {
      return childSemantic;
    }
  }

  return null;
};

export const GridBlock = ({
  block,
  data,
  children,
  device = "desktop"
}: GridBlockProps) => {

  const gridRef =
    useRef<HTMLDivElement | null>(
      null
    );

  // =====================================
  // RUNTIME NODE
  // =====================================

  const runtime =
    useRuntimeNode({

      block,

      type: "grid",

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
    data || block?.data;

  // =====================================
  // RESOLVED STYLE
  // =====================================

  const resolved =
    useResolvedStyle(
      (source?.style || {}) as any,
      device
    ) as any;


const templateColumns =

  device === "mobile"
    ? (
        source?.style?.mobile?.gridTemplateColumns ||
        "1fr"
      )
    : device === "tablet"
      ? (
          source?.style?.tablet?.gridTemplateColumns ||
          "repeat(2, minmax(0, 1fr))"
        )
    : resolved.gridTemplateColumns ||

  (
    "repeat(auto-fit, minmax(320px, 1fr))"
  );


  // =====================================
  // CHILDREN
  // =====================================

  const hasChildren =

    (block?.children?.length || 0)
    > 0;

  useEffect(
    () => {

      if (
        !gridRef.current
      ) {

        return;
      }

      const gridElement =
        gridRef.current;

      const pickComputed = (
        element: Element
      ) => {

        const style =
          window.getComputedStyle(
            element
          );

        return {
          tag:
            element.tagName.toLowerCase(),
          className:
            element.getAttribute(
              "class"
            ),
          id:
            element.getAttribute(
              "id"
            ),
          blockType:
            element.getAttribute(
              "data-block-type"
            ),
          display:
            style.display,
          width:
            style.width,
          minWidth:
            style.minWidth,
          maxWidth:
            style.maxWidth,
          height:
            style.height,
          gridColumn:
            style.gridColumn,
          flex:
            style.flex,
          overflow:
            style.overflow
        };
      };

      console.log(
        "GRID DOM STRUCTURE",
        {
          grid:
            {
              ...pickComputed(
                gridElement
              ),
              gridTemplateColumns:
                window.getComputedStyle(
                  gridElement
                ).gridTemplateColumns
            },
          children:
            Array.from(
              gridElement.children
            ).map(
              child => ({
                outer:
                  pickComputed(
                    child
                  ),
                inner:
                  child.firstElementChild
                    ? pickComputed(
                        child.firstElementChild
                      )
                    : null
              })
            )
        }
      );
    },
    [
      block?.children?.length,
      templateColumns
    ]
  );

  // =====================================
  // GRID STYLE
  // =====================================

  const gridStyle:
  React.CSSProperties = {

    display:
      "grid",

    pointerEvents:
      "auto",

    overflow:
      resolved.overflow || "visible",

   gridTemplateColumns: templateColumns,
 gridAutoRows:"auto",
alignItems: resolved.alignItems || "stretch",

justifyItems: resolved.justifyItems || "stretch",

justifyContent:resolved.justifyContent || "stretch",

gap:
  resolved.gap || "24px",

width:
  "100%",
   

  maxWidth:
  resolved.maxWidth && resolved.maxWidth !== "none"
    ? resolved.maxWidth
    : "100%",

margin:
  resolved.margin || "0 auto",

    minWidth:
      0,

    minHeight:
      hasChildren
        ? undefined
        : "180px",

    padding:
      resolved.padding,

    paddingTop:
      resolved.paddingTop,

    paddingRight:
      resolved.paddingRight,

    paddingBottom:
      resolved.paddingBottom,

    paddingLeft:
      resolved.paddingLeft,

    boxSizing:
      "border-box",

    position:
      "relative",

    borderRadius:
      resolved.borderRadius || "0px",

    border:
      isOver

        ? "2px solid #3b82f6"

        : resolved.border || "none",

    background:
      isOver

        ? "#eff6ff"

        : (
            resolved.background ||
            resolved.backgroundColor ||
            "transparent"
          ),

    color:
      resolved.color,

    boxShadow:
      isOver

        ? "0 0 0 4px rgba(59,130,246,0.08)"

        : resolved.boxShadow || "none",

    transition:
      "all 0.15s ease-in-out"
  };

  console.log(
    "GRID_CONTAINER_STYLE",
    {
      id:
        block?.id,
      rawDesktop:
        source?.style?.desktop,
      resolved,
      finalStyle:
        gridStyle
    }
  );

  if (
    device === "mobile"
  ) {
    console.log(
      "MOBILE_LAYOUT_REPORT",
      {
        blockType:
          "grid",
        id:
          block?.id,
        semanticTypeAncestor:
          findSemanticType(
            block
          ),
        childTypes:
          (block?.children || []).map(
            (child: any) => child.type
          ),
        rawStyle:
          source?.style,
        rawDesktop:
          source?.style?.desktop,
        rawMobile:
          source?.style?.mobile,
        resolvedStyle:
          resolved,
        finalStyle:
          gridStyle
      }
    );
  }

  if (
    device === "tablet"
  ) {
    console.log(
      "TABLET_LAYOUT_REPORT",
      {
        blockType:
          "grid",
        id:
          block?.id,
        semanticTypeAncestor:
          findSemanticType(
            block
          ),
        childTypes:
          (block?.children || []).map(
            (child: any) => child.type
          ),
        rawStyle:
          source?.style,
        rawDesktop:
          source?.style?.desktop,
        rawTablet:
          source?.style?.tablet,
        resolvedStyle:
          resolved,
        finalStyle:
          gridStyle
      }
    );
  }

  // =====================================
  // RENDER
  // =====================================

  return (

    <div
      {...rootProps}

      ref={gridRef}

      style={gridStyle}
    >

      {!hasChildren && (

        <div
          style={{
            gridColumn: "1 / -1",

            pointerEvents:
              "none",

            minHeight:
              "100px",

            display:
              "flex",

            alignItems:
              "center",

            justifyContent:
              "center",

            borderRadius:
              "10px",

            background:
              isOver

                ? "rgba(59,130,246,0.08)"

                : "rgba(0,0,0,0.02)",

            color:
              isOver

                ? "#2563eb"

                : "#6b7280",

            fontSize:
              "14px",

            fontWeight:
              500,

            transition:
              "all 0.15s ease-in-out"
          }}
        >

          {isOver
            ? " Drop inside Grid Layout"
            : "Grid Layout"}

        </div>
      )}

      {children}

    </div>
  );
};

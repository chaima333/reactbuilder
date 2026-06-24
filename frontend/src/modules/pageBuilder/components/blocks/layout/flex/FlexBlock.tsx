import React from "react";

import {
  useResolvedStyle
} from "../../../../core/theme/useResolvedStyle";

import {
  useRuntimeNode
} from "../../../../hooks/useRuntimeNode";

const hasSemanticRole = (
  block: any,
  role: string
): boolean => {
  if (!block) {
    return false;
  }

  if (
    block?.data?.props?.semanticRole === role ||
    block?.props?.semanticRole === role
  ) {
    return true;
  }

  return (block.children || []).some(
    (child: any) =>
      hasSemanticRole(
        child,
        role
      )
  );
};

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

export const FlexBlock = ({
  block,
  children,
  device = "desktop"
}: any) => {

  // =====================================
  // STYLE SOURCE
  // =====================================

  const source = {
    style: {
      ...(block?.style || {}),
      ...(block?.data?.style || {})
    }
  };

  // =====================================
  // RESOLVED STYLE
  // =====================================

const resolved =
  useResolvedStyle(
    (source.style || {}) as any,
    device
  ) as Record<string, any>;

  // =====================================
  // RUNTIME NODE
  // =====================================

  const runtime =
    useRuntimeNode({

      block,

      type: "flex",

      droppable: true
    });

  const {
    isOver,
    rootProps
  } = runtime;

  // =====================================
  // FLEX DIRECTION
  // =====================================

  const flexDirection =
    device === "mobile" &&
    !hasSemanticRole(
      block,
      "kpiNumber"
    )
      ? "column"
      : resolved.flexDirection ||
    (
      device === "mobile"
        ? "column"
        : "row"
    );

  // =====================================
  // FLEX STYLE
  // =====================================

  const hasPaddingShorthand =
  !!resolved.padding;

const hasMarginShorthand =
  !!resolved.margin;

  const flexStyle:
  React.CSSProperties = {
    

    display:
  resolved.display || "flex",

    flexDirection:
      flexDirection,

    flexWrap:
      resolved.flexWrap ||
      (
        flexDirection === "column"
          ? "nowrap"
          : "wrap"
      ),

    justifyContent:
      resolved.justifyContent ||
      "flex-start",

    alignItems:
      resolved.alignItems ||
      "stretch",

    gap:
      resolved.gap ||
      "24px",

    width:
      resolved.width ||
      "100%",

    maxWidth:
      resolved.maxWidth ||
      "100%",

    minWidth:
      resolved.minWidth ||
      0,

    minHeight:
      resolved.minHeight,

    padding:
      resolved.padding,
paddingTop:
  hasPaddingShorthand
    ? undefined
    : resolved.paddingTop,

paddingBottom:
  hasPaddingShorthand
    ? undefined
    : resolved.paddingBottom,

paddingLeft:
  hasPaddingShorthand
    ? undefined
    : resolved.paddingLeft,

paddingRight:
  hasPaddingShorthand
    ? undefined
    : resolved.paddingRight,

    margin:
  resolved.margin,
 
marginTop:
  hasMarginShorthand
    ? undefined
    : resolved.marginTop,


    marginBottom:
    hasMarginShorthand
    ? undefined
     : resolved.marginBottom,

    marginLeft:
    hasMarginShorthand
    ? undefined
     : resolved.marginLeft,

    marginRight:
    hasMarginShorthand
    ? undefined
     : resolved.marginRight,

    backgroundColor:
      resolved.backgroundColor,

    borderRadius:
      resolved.borderRadius,

    boxSizing:
      "border-box",
position:
  resolved.position || "relative",

top:
  resolved.top,

left:
  resolved.left,

right:
  resolved.right,

bottom:
  resolved.bottom,

zIndex:
  resolved.zIndex,

overflow:
  resolved.overflow || "visible",

boxShadow:
  resolved.boxShadow,

border:
  isOver
    ? "2px solid #3b82f6"
    : resolved.border
        
  };
  
  const isFeatureCard =
  String(block?.id || "").startsWith("feature-");

const enhancedFlexStyle: React.CSSProperties = {
  ...flexStyle,
  transition: isFeatureCard
    ? "transform 0.25s ease, box-shadow 0.25s ease"
    : flexStyle.transition,
};

  
  if (
    device === "mobile"
  ) {
    console.log(
      "MOBILE_LAYOUT_REPORT",
      {
        blockType:
          "flex",
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
          source.style,
        rawDesktop:
          source.style?.desktop,
        rawMobile:
          source.style?.mobile,
        resolvedStyle:
          resolved,
        finalStyle:
          flexStyle
      }
    );
  }

  if (
    block?.children?.length === 3 &&
    block.children.every(
      (child: any) =>
        child?.type === "flexItem"
    )
  ) {
    console.log(
      "FEATURE_CARDS_PARENT",
      JSON.stringify(
        {
          id: block.id,
          childCount: block.children.length,
          resolvedStyle: resolved,
          finalStyle: flexStyle
        },
        null,
        2
      )
    );
  }

  if (
    hasSemanticRole(
      block,
      "kpiNumber"
    )
  ) {
    console.log(
      "KPI_ROW_RUNTIME",
      JSON.stringify(
        {
          id:
            block?.id,
          childTypes:
            (block?.children || []).map(
              (child: any) => child.type
            ),
          childCount:
            (block?.children || []).length,
          resolvedStyle:
            resolved,
          finalDomStyle:
            flexStyle,
          flexDirection:
            flexStyle.flexDirection,
          flexWrap:
            flexStyle.flexWrap,
          gap:
            flexStyle.gap,
          justifyContent:
            flexStyle.justifyContent,
          alignItems:
            flexStyle.alignItems
        },
        null,
        2
      )
    );
  }

  // =====================================
  // RENDER
const isNavbarSubmenu =
  block?.data?.props?.semanticRole === "dropdown" ||
  block?.props?.semanticRole === "dropdown" ||
  String(block?.id || "").startsWith("navbar-submenu-");

if (isNavbarSubmenu) {
  console.log(
    "SUBMENU_BLOCK_FOUND",
    block.id
  );
}

if (isNavbarSubmenu) {
  console.log(
    "SUBMENU_CHILDREN",
    block.children?.map(
      (c:any) => ({
        id: c.id,
        type: c.type
      })
    )
  );
}
  return (

  <div
  {...rootProps}
  className={[
    rootProps.className,
    isNavbarSubmenu ? "navbar-submenu" : ""
  ].filter(Boolean).join(" ")}
  style={enhancedFlexStyle}
  onMouseEnter={(e) => {
    if (!isFeatureCard) return;
    e.currentTarget.style.transform = "translateY(-6px)";
    e.currentTarget.style.boxShadow = "0 16px 35px rgba(0,0,0,0.14)";
  }}
  onMouseLeave={(e) => {
    if (!isFeatureCard) return;
    e.currentTarget.style.transform = "";
    e.currentTarget.style.boxShadow =
      String(enhancedFlexStyle.boxShadow || "");
  }}
>

      {children}

      {(!block?.children ||
        block.children.length === 0) && (

        <div
          style={{
            width: "100%",
            padding: "20px",
            textAlign: "center",
            color: "#6b7280",
          }}
        >
          {isOver
            ? "Drop here!"
            : "Flex Layout (Empty)"}
        </div>
      )}

    </div>
  );
};

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

const getOwnSemanticRole = (
  block: any
) =>
  block?.data?.props?.semanticRole ||
  block?.props?.semanticRole ||
  "";

const getBlockText = (
  block: any
): string => {
  if (!block) {
    return "";
  }

  const props =
    block?.data?.props ||
    block?.props ||
    {};

  return [
    props.content,
    props.text,
    props.label,
    props.title,
    ...(block.children || []).map(
      getBlockText
    )
  ]
    .filter(Boolean)
    .join(" ");
};

const looksLikeKpiMetric = (
  block: any
) =>
  hasSemanticRole(
    block,
    "kpiNumber"
  ) ||
  /(?:[$€£]\s*)?\d[\d\s.,]*(?:[a-z]+)?\s*[+%]?/i.test(
    getBlockText(
      block
    )
  );

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

  const semanticRole =
    getOwnSemanticRole(
      block
    );

  const isKpiRow =
    semanticRole === "kpiRow" ||
    (
      (block?.children?.length || 0) >= 3 &&
      block.children.every(
        (child: any) =>
          looksLikeKpiMetric(
            child
          )
      )
    );

  const flexDirection =
    isKpiRow
      ? "row"
      : device === "mobile" &&
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
  isKpiRow
    ? "flex"
    : resolved.display || "flex",

    flexDirection:
      flexDirection,

    flexWrap:
      isKpiRow
        ? "nowrap"
        : resolved.flexWrap ||
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
   
  }

  if (
    block?.children?.length === 3 &&
    block.children.every(
      (child: any) =>
        child?.type === "flexItem"
    )
  ) {
    
  }

  if (
    hasSemanticRole(
      block,
      "kpiNumber"
    )
  ) {
   
  }

  // =====================================
  // RENDER
const isNavbarSubmenu =
  block?.data?.props?.semanticRole === "dropdown" ||
  block?.props?.semanticRole === "dropdown" ||
  String(block?.id || "").startsWith("navbar-submenu-");

if (isNavbarSubmenu) {

}

if (isNavbarSubmenu) {
 
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

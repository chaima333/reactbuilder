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

const resolveFlexContract = (
  resolved: Record<string, any>
) => {

  const flexParts =
    typeof resolved.flex === "string"
      ? resolved.flex.trim().split(/\s+/)
      : [];

  const hasFlexShorthand =
    flexParts.length > 0;

  const hasOnlyDefaultFlexFields =
    !hasFlexShorthand &&
    String(resolved.flexGrow) === "1" &&
    String(resolved.flexShrink) === "1" &&
    resolved.flexBasis === "auto";

  if (hasOnlyDefaultFlexFields) {
    return {
      flexGrow: undefined,
      flexShrink: undefined,
      flexBasis: undefined
    };
  }

  const flexGrow =
    hasFlexShorthand
      ? flexParts[0]
      : resolved.flexGrow;

  const flexShrink =
    hasFlexShorthand
      ? flexParts[1]
      : resolved.flexShrink;

  const shorthandBasis =
    flexParts.slice(2).join(" ");

  const flexBasis =
    hasFlexShorthand
      ? shorthandBasis || undefined
      : resolved.flexBasis;

  return {
    flexGrow,
    flexShrink,
    flexBasis
  };
};

export const FlexItemBlock = ({
  block,
  children,
  device = "desktop"
}: any) => {

  // =====================================
  // RUNTIME NODE
  // =====================================

  const runtime =
    useRuntimeNode({

      block,

      type: "flexItem",

      droppable: true
    });

  const {
    context,
    rootProps
  } = runtime;

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
    source.style,
    device
  ) as Record<string, any>;

  // =====================================
  // FLEX CONTRACT
  // =====================================

  const flexContract =
    resolveFlexContract(
      resolved
    );

  const preserveMobileRowItem =
    device === "mobile" &&
    hasSemanticRole(
      block,
      "kpiNumber"
    );

  const forceMobileStackItem =
    device === "mobile" &&
    !preserveMobileRowItem;

  const isDesktopThirdColumnItem =
    String(
      resolved.flex || ""
    ).includes(
      "33.333"
    ) ||
    String(
      resolved.maxWidth || ""
    ).includes(
      "33.333"
    ) ||
    String(
      resolved.width || ""
    ).includes(
      "33.333"
    );

  const forceTabletTwoColumnItem =
    device === "tablet" &&
    isDesktopThirdColumnItem;

  // =====================================
  // ITEM STYLE
  // =====================================

const hasDropdownChild =
  (block?.children || []).some(
    (child: any) =>
      child?.data?.props?.semanticRole === "dropdown" ||
      child?.props?.semanticRole === "dropdown" ||
      (
        child?.type === "flex" &&
        String(child?.id || "").startsWith("navbar-submenu-")
      )
  );

const hasChildren =
  React.Children.count(children) > 0 ||
  (block?.children?.length || 0) > 0;

const isEditorEmpty =
  context.mode === "editor" &&
  !hasChildren;

 if (
  String(block?.id || "").includes("navbar-link-item")
) {

}
const itemStyle: React.CSSProperties = {
  flexGrow: forceMobileStackItem
    ? undefined
    : forceTabletTwoColumnItem
      ? 1
      : flexContract.flexGrow,
  flexShrink: forceMobileStackItem
    ? 0
    : forceTabletTwoColumnItem
      ? 1
      : flexContract.flexShrink,
  flexBasis: forceMobileStackItem
    ? "auto"
    : forceTabletTwoColumnItem
      ? "calc(50% - 12px)"
      : flexContract.flexBasis,

  width: forceMobileStackItem
    ? "100%"
    : forceTabletTwoColumnItem
      ? "calc(50% - 12px)"
    : resolved.width,
  maxWidth: forceMobileStackItem
    ? "100%"
    : forceTabletTwoColumnItem
      ? "calc(50% - 12px)"
    : resolved.maxWidth,
  minWidth: resolved.minWidth || 0,
  minHeight:
    isEditorEmpty
      ? resolved.minHeight || "96px"
      : resolved.minHeight,

  display:
    isEditorEmpty
      ? resolved.display || "flex"
      : resolved.display,
  flexDirection: resolved.flexDirection,
  justifyContent:
    isEditorEmpty
      ? resolved.justifyContent || "center"
      : resolved.justifyContent,
  alignItems:
    isEditorEmpty
      ? resolved.alignItems || "center"
      : resolved.alignItems,
  gap: resolved.gap,

  padding:
    isEditorEmpty
      ? resolved.padding || "16px"
      : resolved.padding,
  paddingTop:
    isEditorEmpty
      ? resolved.paddingTop || resolved.padding || "16px"
      : resolved.paddingTop,
  paddingBottom:
    isEditorEmpty
      ? resolved.paddingBottom || resolved.padding || "16px"
      : resolved.paddingBottom,
  paddingLeft:
    isEditorEmpty
      ? resolved.paddingLeft || resolved.padding || "16px"
      : resolved.paddingLeft,
  paddingRight:
    isEditorEmpty
      ? resolved.paddingRight || resolved.padding || "16px"
      : resolved.paddingRight,

  margin: resolved.margin,
  marginTop: resolved.marginTop,
  marginBottom: resolved.marginBottom,
  marginLeft: resolved.marginLeft,
  marginRight: resolved.marginRight,

  background: resolved.background,
  backgroundColor: resolved.background
    ? undefined
    : isEditorEmpty
      ? resolved.backgroundColor ||
        "var(--mui-palette-action-hover, rgba(25, 118, 210, 0.06))"
      : resolved.backgroundColor,
  border:
    isEditorEmpty
      ? resolved.border ||
        "1px dashed var(--mui-palette-divider, rgba(25, 118, 210, 0.4))"
      : resolved.border,
  borderRadius: resolved.borderRadius,
boxSizing: "border-box",
color:
  isEditorEmpty
    ? resolved.color ||
      "var(--mui-palette-text-secondary, rgba(0, 0, 0, 0.6))"
    : resolved.color,

position:
  resolved.position ||
  "relative",

overflow:
  resolved.overflow ||
  "visible",

zIndex:
  resolved.zIndex
};

const childTypes =
  (block?.children || []).map(
    (child: any) => child.type
  );

if (
  childTypes.includes("title") &&
  childTypes.includes("text") &&
  childTypes.includes("flex") &&
  childTypes.length === 4
) {
 
}


if (
  device === "mobile"
) {
 
}

if (
  device === "tablet" &&
  forceTabletTwoColumnItem
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
  // =====================================
  return (
  
 <div
  {...rootProps}
  className={[
    rootProps.className,
    hasDropdownChild ? "navbar-dropdown-parent" : ""
  ].filter(Boolean).join(" ")}
  style={itemStyle}
>
  {isEditorEmpty
    ? "Drop blocks here (Flex Item)"
    : children}
</div>
);
};

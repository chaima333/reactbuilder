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

  display: resolved.display,
  flexDirection: resolved.flexDirection,
  justifyContent: resolved.justifyContent,
  alignItems: resolved.alignItems,
  gap: resolved.gap,

  padding: resolved.padding,
  paddingTop: resolved.paddingTop,
  paddingBottom: resolved.paddingBottom,
  paddingLeft: resolved.paddingLeft,
  paddingRight: resolved.paddingRight,

  margin: resolved.margin,
  marginTop: resolved.marginTop,
  marginBottom: resolved.marginBottom,
  marginLeft: resolved.marginLeft,
  marginRight: resolved.marginRight,

  background: resolved.background,
  backgroundColor: resolved.background
    ? undefined
    : resolved.backgroundColor,
  border: resolved.border,
  borderRadius: resolved.borderRadius,

  boxSizing: "border-box",
  position: "relative"
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
  console.log(
    "FEATURE_CARD_RUNTIME",
    JSON.stringify(
      {
        id: block?.id,
        childTypes,
        resolvedStyle: {
          flex: resolved.flex,
          width: resolved.width,
          maxWidth: resolved.maxWidth,
          padding: resolved.padding,
          paddingTop: resolved.paddingTop,
          paddingBottom: resolved.paddingBottom,
          paddingLeft: resolved.paddingLeft,
          paddingRight: resolved.paddingRight,
          background: resolved.background,
          backgroundColor: resolved.backgroundColor,
          borderRadius: resolved.borderRadius,
          display: resolved.display,
          flexDirection: resolved.flexDirection,
          gap: resolved.gap
        },
        finalStyle: {
          flexGrow: itemStyle.flexGrow,
          flexShrink: itemStyle.flexShrink,
          flexBasis: itemStyle.flexBasis,
          width: itemStyle.width,
          maxWidth: itemStyle.maxWidth,
          padding: itemStyle.padding,
          paddingTop: itemStyle.paddingTop,
          paddingBottom: itemStyle.paddingBottom,
          paddingLeft: itemStyle.paddingLeft,
          paddingRight: itemStyle.paddingRight,
          background: itemStyle.background,
          backgroundColor: itemStyle.backgroundColor,
          borderRadius: itemStyle.borderRadius,
          display: itemStyle.display,
          flexDirection: itemStyle.flexDirection,
          gap: itemStyle.gap
        }
      },
      null,
      2
    )
  );
}

console.log(
  "RUNTIME FLEXITEM STYLE TRACE",
  {
    id:
      block?.id,
    childTypes:
      childTypes,
    rawStyle:
      source.style,
    resolvedStyle:
      resolved,
    finalStyle:
      itemStyle
  }
);

if (
  device === "mobile"
) {
  console.log(
    "MOBILE_LAYOUT_REPORT",
    {
      blockType:
        "flexItem",
      id:
        block?.id,
      semanticTypeAncestor:
        findSemanticType(
          block
        ),
      childTypes,
      rawStyle:
        source.style,
      rawDesktop:
        source.style?.desktop,
      rawMobile:
        source.style?.mobile,
      resolvedStyle:
        resolved,
      finalStyle:
        itemStyle
    }
  );
}

if (
  device === "tablet" &&
  forceTabletTwoColumnItem
) {
  console.log(
    "TABLET_LAYOUT_REPORT",
    {
      blockType:
        "flexItem",
      id:
        block?.id,
      semanticTypeAncestor:
        findSemanticType(
          block
        ),
      childTypes,
      rawStyle:
        source.style,
      rawDesktop:
        source.style?.desktop,
      rawTablet:
        source.style?.tablet,
      resolvedStyle:
        resolved,
      finalStyle:
        itemStyle
    }
  );
}

if (
  hasSemanticRole(
    block,
    "kpiNumber"
  )
) {
  console.log(
    "KPI_ITEM_RUNTIME",
    JSON.stringify(
      {
        id:
          block?.id,
        childTypes:
          childTypes,
        width:
          itemStyle.width,
        maxWidth:
          itemStyle.maxWidth,
        resolvedFlex:
          resolved.flex,
        resolvedFlexGrow:
          resolved.flexGrow,
        resolvedFlexShrink:
          resolved.flexShrink,
        resolvedFlexBasis:
          resolved.flexBasis,
        flexGrow:
          itemStyle.flexGrow,
        flexShrink:
          itemStyle.flexShrink,
        flexBasis:
          itemStyle.flexBasis,
        resolvedStyle:
          resolved,
        finalDomStyle:
          itemStyle
      },
      null,
      2
    )
  );
}

  // =====================================
  // RENDER
  // =====================================

  return (

    <div
      {...rootProps}
      style={itemStyle}
    >

      {children}

    </div>
  );
};

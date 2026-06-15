import React from "react";

import {
  useResolvedStyle
} from "../../../../core/theme/useResolvedStyle";

import {
  useRuntimeNode
} from "../../../../hooks/useRuntimeNode";

export const NavbarBlock = ({
  block,
  children,
  device = "desktop"
}: any) => {

  // =====================================
  // RESPONSIVE STYLE
  // =====================================

  const source = {
    style: {
      ...(block?.style || {}),
      ...(block?.data?.style || {})
    }
  };

  const resolved =
    useResolvedStyle(
      (source.style || {}) as any,
      device
    );

  const resolvedCss =
    resolved as any;

  // =====================================
  // RUNTIME NODE
  // =====================================

  const runtime =
    useRuntimeNode({

      block,

      type: "navbar",

      droppable: true
    });

  const {
    context,
    isOver,
    rootProps
  } = runtime;

  // =====================================
  // DEBUG
  // =====================================

  if (
    context.mode ===
    "editor"
  ) {

    console.log(
      "🔥 NAVBAR METADATA",
      block?.data?.props?.semantic
    );
  }

  console.log(
  "NAVBAR_RENDER",
  {
    id: block?.id,
    type: block?.type,
    childrenCount:
      block?.children?.length,
    resolved,
    block
  }
);
console.log(
  "STYLE_RESOLVE",
  block?.id
);
  // =====================================
  // RESPONSIVE FLEX
  // =====================================

  const flexDirection =
    resolved.flexDirection ||
    (
      device === "mobile"
        ? "column"
        : "row"
    );

  // =====================================
  // NAVBAR STYLE
  // =====================================

  const navbarStyle:
  React.CSSProperties = {

    display:
      "flex",

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
      "space-between",

    alignItems:
      resolved.alignItems ||
      "center",

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
      resolved.paddingTop,

    paddingBottom:
      resolved.paddingBottom,

    paddingLeft:
      resolved.paddingLeft,

    paddingRight:
      resolved.paddingRight,

    marginTop:
      resolved.marginTop,

    marginBottom:
      resolved.marginBottom,

    marginLeft:
      resolved.marginLeft,

    marginRight:
      resolved.marginRight,

    backgroundColor:
      resolved.backgroundColor,

    background:
      resolvedCss.background,

    color:
      resolved.color,

    borderBottom:
      resolvedCss.borderBottom,

    boxShadow:
      resolvedCss.boxShadow,

    backdropFilter:
      resolvedCss.backdropFilter,

    borderRadius:
      resolved.borderRadius,

    boxSizing:
      "border-box",

    position:
      "relative",

    overflow:
      "visible",

    whiteSpace:
      resolvedCss.whiteSpace ||
      "nowrap",

    border:
      isOver
        ? "2px solid #3b82f6"
        : undefined,

    cursor:
      resolved.cursor
  };

  // =====================================
  // RENDER
  // =====================================

  return (

    <nav
      {...rootProps}
      style={navbarStyle}
    >

      {children}

      {(!block?.children ||
        block.children.length === 0) && (

        <div
          style={{
            width: "100%",
            padding: "20px",
            textAlign: "center",
            color: "#6b7280"
          }}
        >
          {isOver
            ? "Drop here!"
            : "Navbar Layout (Empty)"}
        </div>
      )}

    </nav>
  );
};

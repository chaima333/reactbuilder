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
  <style>
    {`
      .navbar-dropdown-parent > .navbar-submenu {
        display: none !important;
      }

      .navbar-dropdown-parent:hover > .navbar-submenu {
        display: flex !important;
      }
    `}
  </style>

  {children}

    </nav>
  );
};

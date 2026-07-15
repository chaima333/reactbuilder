import React from "react";

import {
  useResolvedStyle
} from "../../../../core/theme/useResolvedStyle";

import {
  useRuntimeNode
} from "../../../../hooks/useRuntimeNode";
import { useGetPublicSiteQuery } from "../../../../../../redux/services/sites.api";
import { useParams } from "react-router-dom";

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
  
  // =====================================
  // NAVBAR PROPS (كل القيم من هنا)
  // =====================================

  const navbarProps =
    block?.data?.props ||
    block?.props ||
    {};

  // خذ كل القيم من props مع قيم افتراضية
  const {
    dynamicPagesLabel = "Pages",
    dropdownBg = "#0f172a",
    dropdownColor = "#ffffff",
    dropdownMinWidth = "220px",
    dropdownPadding = "12px",
    dropdownBorderRadius = "12px",
    dropdownBoxShadow = "0 12px 30px rgba(0,0,0,0.18)",
    dropdownGap = "10px",
    dropdownFontWeight = 700,
    linkFontWeight = 600,
    dropdownZIndex = 99999,
    dropdownPosition = "relative",
    dropdownDisplay = "flex",
    dropdownAlignItems = "center",
    dropdownCursor = "pointer",
    dropdownWhiteSpace = "nowrap",
    linkTextDecoration = "none",
    linkWhiteSpace = "nowrap"
  } = navbarProps;

  const {
    siteId
  } = useParams();

  const isPublicSiteRoute =
    window.location.pathname.startsWith("/site/");

  const {
    data: publicSiteData
  } = useGetPublicSiteQuery(
    Number(siteId),
    {
      skip:
        !isPublicSiteRoute ||
        !siteId
    }
  );

  const normalizeNavText = (
    value: any
  ) =>
    String(value || "")
      .trim()
      .toLowerCase();

  const collectExistingLabels = (
    node: any
  ): string[] => {
    const props =
      node?.data?.props ||
      node?.props ||
      {};

    const ownValues = [
      props.label,
      props.content,
      props.text,
      props.title
    ]
      .filter(Boolean)
      .map(normalizeNavText);

    const childValues =
      (node?.children || [])
        .flatMap(collectExistingLabels);

    return [
      ...ownValues,
      ...childValues
    ];
  };

  const existingLabels =
    new Set(
      collectExistingLabels(block)
    );

  const dynamicPages =
    isPublicSiteRoute
      ? (
        publicSiteData?.pages || []
      )
        .filter((page: any) =>
          page.status === "published"
        )
        .filter((page: any) => {
          const title =
            normalizeNavText(page.title);

          const slug =
            normalizeNavText(page.slug);

          return (
            !existingLabels.has(title) &&
            !existingLabels.has(slug)
          );
        })
      : [];

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
      
    zIndex: 9999,

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

  const navbarChildren =
    React.Children.toArray(children);

  const dynamicPagesMenu =
    dynamicPages.length > 0 ? (
      <div
        className="navbar-dropdown-parent"
        style={{
          position: dropdownPosition,
          display: dropdownDisplay,
          alignItems: dropdownAlignItems,
          fontWeight: dropdownFontWeight,
          cursor: dropdownCursor,
          whiteSpace: dropdownWhiteSpace
        }}
      >
        {dynamicPagesLabel}
        <div
          className="navbar-submenu"
          style={{
            position: "absolute",
            top: "100%",
            right: 0,
            minWidth: dropdownMinWidth,
            padding: dropdownPadding,
            background: resolved.backgroundColor || dropdownBg,
            color: resolved.color || dropdownColor,
            borderRadius: dropdownBorderRadius,
            boxShadow: dropdownBoxShadow,
            flexDirection: "column",
            gap: dropdownGap
          }}
        >
          {dynamicPages.map((page: any) => (
            <a
              key={page.id}
              href={
                page.slug === "home"
                  ? `/site/${siteId}`
                  : `/site/${siteId}/${page.slug}`
              }
              style={{
                color: "inherit",
                textDecoration: linkTextDecoration,
                fontWeight: linkFontWeight,
                whiteSpace: linkWhiteSpace
              }}
            >
              {page.title || page.slug}
            </a>
          ))}
        </div>
      </div>
    ) : null;

  // =====================================
  // CSS STYLES (كل القيم من props)
  // =====================================

  const dropdownStyles = `
    .navbar-dropdown-parent {
      position: ${dropdownPosition} !important;
      overflow: visible !important;
      z-index: ${dropdownZIndex} !important;
    }

    .navbar-dropdown-parent::after {
      content: "" !important;
      position: absolute !important;
      top: 100% !important;
      left: 0 !important;
      right: 0 !important;
      height: 16px !important;
      pointer-events: auto !important;
      z-index: ${dropdownZIndex - 1} !important;
    }

    .navbar-dropdown-parent .navbar-submenu {
      display: none !important;
      z-index: ${dropdownZIndex} !important;
    }

    .navbar-dropdown-parent:hover .navbar-submenu,
    .navbar-dropdown-parent:focus-within .navbar-submenu,
    .navbar-dropdown-parent .navbar-submenu:hover {
      display: flex !important;
    }
  `;

  // =====================================
  // RENDER
  // =====================================

  return (
    <nav
      {...rootProps}
      style={navbarStyle}
    >
      <style>
        {dropdownStyles}
      </style>

      {children}
    </nav>
  );
};
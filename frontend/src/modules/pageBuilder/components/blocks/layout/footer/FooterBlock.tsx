import React from "react";

import {
  useResolvedStyle
} from "../../../../core/theme/useResolvedStyle";

import {
  useRuntimeNode
} from "../../../../hooks/useRuntimeNode";

export const FooterBlock = ({
  block,
  children,
  device = "desktop"
}: any) => {
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

  const {
    isOver,
    rootProps
  } =
    useRuntimeNode({
      block,
      type: "footer",
      droppable: true
    });

  const footerStyle: React.CSSProperties = {
    display: resolved.display || "flex",
    flexDirection: resolved.flexDirection || "column",
    flexWrap: resolved.flexWrap || "wrap",
    justifyContent: resolved.justifyContent || "flex-start",
    alignItems: resolved.alignItems || "stretch",
    gap: resolved.gap || "32px",
    width: resolved.width || "100%",
    maxWidth: resolved.maxWidth || "100%",
    minHeight: resolved.minHeight,
    padding: resolved.padding,
    paddingTop: resolved.paddingTop,
    paddingBottom: resolved.paddingBottom,
    paddingLeft: resolved.paddingLeft,
    paddingRight: resolved.paddingRight,
    marginTop: resolved.marginTop,
    marginBottom: resolved.marginBottom,
    marginLeft: resolved.marginLeft,
    marginRight: resolved.marginRight,
    background: resolvedCss.background,
    backgroundColor: resolved.backgroundColor,
    color: resolved.color,
    borderTop: resolvedCss.borderTop,
    borderBottom: resolvedCss.borderBottom,
    boxShadow: resolvedCss.boxShadow,
    borderRadius: resolved.borderRadius,
    boxSizing: "border-box",
    position: "relative",
    overflow: resolvedCss.overflow || "visible",
    border:
      isOver
        ? "2px solid #3b82f6"
        : resolvedCss.border,
    cursor: resolved.cursor
  };

  return (
    <footer
      {...rootProps}
      style={footerStyle}
    >
      {children}
    </footer>
  );
};

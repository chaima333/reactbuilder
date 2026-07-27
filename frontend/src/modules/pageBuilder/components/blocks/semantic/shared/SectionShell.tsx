import React from "react";

import { Box } from "@mui/material";

import {
  useResolvedStyle
} from "../../../../core/theme/useResolvedStyle";

interface SectionShellProps {
  children: React.ReactNode;

  style?: any;

  device?:
    | "desktop"
    | "tablet"
    | "mobile";
}

export const SectionShell = ({
  children,
  style,
  device = "desktop"
}: SectionShellProps) => {
  const resolved: any =
    useResolvedStyle(
      style,
      device
    );

  const hasPaddingShorthand =
    !!resolved.padding;

  const hasMarginShorthand =
    !!resolved.margin;

  const outerStyle: any = {
    width:
      resolved.width || "100%",

    minWidth:
      0,

    minHeight:
      resolved.minHeight,

    maxWidth:
      "100%",

    display:
      resolved.display || "block",

    flexDirection:
      resolved.flexDirection,

    justifyContent:
      resolved.justifyContent,

    alignItems:
      resolved.alignItems,

    gap:
      resolved.gap,

    textAlign:
      resolved.textAlign,

    background:
      resolved.background,

    backgroundColor:
      resolved.background
        ? undefined
        : resolved.backgroundColor || "transparent",

    backgroundImage:
      resolved.backgroundImage,

    backgroundSize:
      resolved.backgroundSize,

    backgroundRepeat:
      resolved.backgroundRepeat,

    backgroundPosition:
      resolved.backgroundPosition,

    padding:
      resolved.padding,

    paddingTop:
      resolved.paddingTop ||
      (
        hasPaddingShorthand
          ? undefined
          : "80px"
      ),

    paddingBottom:
      resolved.paddingBottom ||
      (
        hasPaddingShorthand
          ? undefined
          : "80px"
      ),

    paddingLeft:
      resolved.paddingLeft ||
      (
        hasPaddingShorthand
          ? undefined
          : "24px"
      ),

    paddingRight:
      resolved.paddingRight ||
      (
        hasPaddingShorthand
          ? undefined
          : "24px"
      ),

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

    boxSizing:
      "border-box"
  };

  const innerStyle: any = {
    width:
      resolved.width || "100%",

    minWidth:
      0,

    maxWidth:
      resolved.maxWidth || "100%",

    display:
      resolved.display === "flex"
        ? "flex"
        : undefined,

    flexDirection:
      resolved.flexDirection,

    justifyContent:
      resolved.justifyContent,

    alignItems:
      resolved.alignItems,

    gap:
      resolved.gap,

    textAlign:
      resolved.textAlign,

    marginLeft:
      resolved.marginLeft || "auto",

    marginRight:
      resolved.marginRight || "auto",

    boxSizing:
      "border-box",

    position:
      "relative"
  };

  return (
    <Box sx={outerStyle}>
      <Box sx={innerStyle}>
        {children}
      </Box>
    </Box>
  );
};
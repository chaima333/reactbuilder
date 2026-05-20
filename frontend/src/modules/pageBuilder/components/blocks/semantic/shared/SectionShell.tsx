import React from "react";

import { Box } from "@mui/material";

import { useResolvedStyle } from "../../../../core/theme/useResolvedStyle";

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

  const resolved =
    useResolvedStyle(
      style,
      device
    );

  return (

    <Box
      sx={{

        width: "100%",

        minWidth: 0,

        maxWidth: "100%",

        display: "block",

        backgroundColor:
          resolved.backgroundColor || "transparent",

        paddingTop:
          resolved.paddingTop || "80px",

        paddingBottom:
          resolved.paddingBottom || "80px",

        paddingLeft:
          resolved.paddingLeft || "24px",

        paddingRight:
          resolved.paddingRight || "24px",

        boxSizing: "border-box"
      }}
    >

      <Box
        sx={{

          width: "100%",

          minWidth: 0,
 
          maxWidth:
          device === "mobile"
          ? "100%"
          : device === "tablet"
          ? "100%"
           : resolved.maxWidth || "1400px",

          marginLeft: "auto",

          marginRight: "auto",

          boxSizing: "border-box",

          display: "block"
        }}
      >

        {children}

      </Box>

    </Box>
  );
};
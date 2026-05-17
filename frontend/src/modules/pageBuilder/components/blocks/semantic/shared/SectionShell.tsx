// src/modules/pageBuilder/components/blocks/semantic/shared/SectionShell.tsx

import React from "react";

import {
  Box
} from "@mui/material";

import {
  useResolvedStyle
} from "../../../../core/theme/useResolvedStyle";

interface SectionShellProps {

  children:
    React.ReactNode;

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

        boxSizing:
          "border-box"
      }}
    >

      <Box
        sx={{

          width: "100%",

          maxWidth:
            resolved.maxWidth || "1400px",

          marginLeft: "auto",

          marginRight: "auto",

          boxSizing:
            "border-box"
        }}
      >

        {children}

      </Box>

    </Box>
  );
};
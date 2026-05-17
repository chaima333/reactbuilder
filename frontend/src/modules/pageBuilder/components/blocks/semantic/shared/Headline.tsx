import React from "react";
import { Typography } from "@mui/material";
import { useResolvedStyle } from "../../../../core/theme/useResolvedStyle";

export const Headline = ({ text, style, device = "desktop" }: any) => {
  const resolved = useResolvedStyle(style, device);

  return (
    <Typography
      variant="h2"
      sx={{
        fontSize: resolved.fontSize || "48px",
        fontWeight: resolved.fontWeight || 800,
        textAlign: resolved.textAlign || "center",
        color: resolved.color || "#111",
        mb: 2
      }}
    >
      {text}
    </Typography>
  );
};
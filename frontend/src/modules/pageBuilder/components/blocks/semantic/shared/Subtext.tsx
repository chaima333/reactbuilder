import React from "react";
import { Typography } from "@mui/material";
import { useResolvedStyle } from "../../../../core/theme/useResolvedStyle";

interface SubtextProps {
  text: string;
  style?: any;
  device?: "desktop" | "tablet" | "mobile";
}

export const Subtext = ({ text, style, device = "desktop" }: SubtextProps) => {
  const resolved = useResolvedStyle(style, device);

  return (
    <Typography
      component="p"
      sx={{
        fontSize: resolved.fontSize || "20px",
        textAlign: resolved.textAlign || "center",
        color: resolved.color || "#666",
        maxWidth: "720px",
        mx: resolved.textAlign === "left" ? 0 : "auto",
        mb: 4,
        lineHeight: 1.6
      }}
    >
      {text}
    </Typography>
  );
};
import React from "react";
import { Box } from "@mui/material";

interface ColumnBlockProps {
  children?: React.ReactNode;
  data: {
    style?: any;
    props?: any;
  };
  device?: string;
  preview?: boolean;
}

export const ColumnBlock = ({ children, data, device = "desktop" }: ColumnBlockProps) => {
  // استخراج الـ styles حسب الجهاز (Responsive)
  const styles = data.style?.[device] || data.style?.desktop || {};

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        flex: styles.flex || "1",
        padding: styles.padding || "10px",
        backgroundColor: styles.backgroundColor || "transparent",
        minHeight: "50px", // باش يبان وقت يكون فارغ
        border: "1px dashed rgba(0,0,0,0.1)", // حدود خفيفة للتمييز في الـ Editor
        gap: "10px",
        ...styles,
      }}
    >
      {/* 🔥 هنا السر: الـ children هوما اللي يبعثهم الـ BlockRenderer */}
      {children}
    </Box>
  );
};
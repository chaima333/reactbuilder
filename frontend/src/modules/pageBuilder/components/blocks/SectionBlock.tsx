import React from "react";
import { Box } from "@mui/material";


export const SectionBlock = ({ children, data, device }: any) => {
  return (
    <div
      style={{
        ...data?.style?.[device],
        minHeight: "120px",
        width: "100%",
        border: "1px dashed #ccc",
        display: "flex",
        flexDirection: "column",
        padding: "20px", // 👈 مساحة باش تنجم تختار الـ Section حتى لو فيها بلوكات
        boxSizing: "border-box"
      }}
    >
      {children}
    </div>
  );
};
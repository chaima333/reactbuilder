import React from "react";
import { Box } from "@mui/material";
import { Block } from "../types/page.types";
import { BlockRenderer } from "../components/editor/BlockRenderer";

// 🔥 حدّث الـ Interface باش تقبل device
interface PageRendererProps {
  blocks: Block[];
  registry: any;
  device: "desktop" | "tablet" | "mobile"; 
}

export const PageRenderer: React.FC<PageRendererProps> = ({ blocks, registry, device }) => {
  return (
    <Box sx={{ width: '100%', minHeight: '100vh', bgcolor: '#fff' }}>
      <BlockRenderer 
        blocks={blocks} 
        registry={registry}
        device={device} // 🟢 توّة الـ BlockRenderer باش يعرف أما Style يفرز
        preview={true} 
      />
    </Box>
  );
};
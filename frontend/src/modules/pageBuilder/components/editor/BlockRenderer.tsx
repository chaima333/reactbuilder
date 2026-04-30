import React from "react";
import { Box, Typography } from "@mui/material";
import { Block } from "../../types/page.types";

interface Props {
  blocks: Block[];
  registry: Record<string, any>; // الـ Registry الديناميكي
  preview: boolean;
  device?: "desktop" | "tablet" | "mobile"; // نضيفو الـ Device كـ Prop
  onUpdate?: (id: string, data: Partial<Block["data"]>) => void;
  onDelete?: (id: string) => void;
}
export const BlockRenderer = ({ 
  blocks, 
  registry, 
  preview, 
  device = "desktop", 
  onUpdate, 
  onDelete 
}: Props) => {
  return (
    <Box sx={{ 
      display: "flex", 
      flexDirection: "column", 
      gap: preview ? 0 : 2,
      width: '100%' 
    }}>
      {blocks.map((block) => {
        const config = registry[block.type];
        
        if (!config) {
          return (
            <Box key={block.id} sx={{ p: 2, border: '1px dashed #ccc' }}>
              <Typography color="error">Bloc inconnu: {block.type}</Typography>
            </Box>
          );
        }

        const Component = config.component;
        return (
          <Component
            key={block.id}
            data={block.data}
            preview={preview}
            device={device} // ✅ توّة كل بلوك باش يعرف "حجمه"
            onChange={(newData: any) => onUpdate?.(block.id, newData)}
            onDelete={() => onDelete?.(block.id)}
          />
        );
      })}
    </Box>
  );
};
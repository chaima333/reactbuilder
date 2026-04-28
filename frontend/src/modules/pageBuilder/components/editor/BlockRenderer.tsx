import React from "react";
import { Box, Typography } from "@mui/material";
import { Block } from "../../types/page.types";

interface Props {
  blocks: Block[];
  registry: Record<string, any>; // الـ Registry الديناميكي
  preview: boolean;
  onUpdate?: (id: string, data: Partial<Block["data"]>) => void;
  onDelete?: (id: string) => void;
}

export const BlockRenderer = ({ blocks, registry, preview, onUpdate, onDelete }: Props) => {
  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2, minHeight: '200px' }}>
      {blocks.map((block: Block) => {
        // نلوجو على الـ Config في الـ Registry الديناميكي
        const config = registry[block.type];

        if (!config) {
          return (
            <Box key={block.id} sx={{ p: 2, border: '1px dashed red', color: 'red' }}>
              <Typography>Bloc inconnu: {block.type}</Typography>
            </Box>
          );
        }

        const Component = config.component;

        return (
          <Box key={block.id}>
            <Component
              data={block.data}
              preview={preview}
              onChange={(newData: any) => onUpdate?.(block.id, newData)}
              onDelete={() => onDelete?.(block.id)}
            />
          </Box>
        );
      })}
    </Box>
  );
};
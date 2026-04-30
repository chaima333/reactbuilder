import React from "react";
import { Box } from "@mui/material";
import { SortableBlock } from "./SortableBlock";

export const EditorCanvas = ({
  blocks, registry, onUpdate, onDelete, onSelect, selectedId, device,
  hoverData, setHoverData // 🔥
}: any) => {
  return (
    <Box sx={{ p: 4, minHeight: '80vh' }}>
      {blocks.map((block: any) => {
        const config = registry[block.type];
        if (!config) return null;
        const Component = config.component;

        return (
          <SortableBlock
            key={block.id}
            id={block.id}
            isSelected={selectedId === block.id}
            onClick={() => onSelect(block.id)}
            onDelete={() => onDelete(block.id)}
            setHoverData={setHoverData} // 🔥
            hoverData={hoverData}       // 🔥
          >
            <Component
              data={block.data}
              device={device}
              onChange={(data: any) => onUpdate(block.id, data)}
            />
          </SortableBlock>
        );
      })}
    </Box>
  );
};
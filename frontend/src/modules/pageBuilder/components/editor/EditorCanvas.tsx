import React from "react";
import { Box } from "@mui/material";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { SortableBlock } from "./SortableBlock";
import { blockRegistry } from "../../core/blockRegistry";
import { Block } from "../../types/page.types";

interface EditorCanvasProps {
  blocks: Block[];
  registry: Record<string, any>;
  onUpdate: (id: string, data: any) => void;
  onDelete: (id: string) => void;
  onSelect: (id: string) => void;
  selectedId?: string | null;
  preview?: boolean;
}

export const EditorCanvas = ({ 
  blocks, 
  registry, 
  onUpdate, 
  onDelete, 
  onSelect, 
  selectedId,
  preview 
}: EditorCanvasProps) => {
  return (
    <Box sx={{ p: 4, bgcolor: preview ? '#fff' : '#f5f5f5', minHeight: '100vh' }}>
      <SortableContext items={blocks.map(b => b.id)} strategy={verticalListSortingStrategy}>
        {blocks.map((block) => {
          // نلوجو في الـ Dynamic Registry أولاً، ثم الـ Static
          const config = registry[block.type] || blockRegistry[block.type as keyof typeof blockRegistry];
          
          if (!config) return null;
          const Component = config.component;

          return (
            <SortableBlock 
              key={block.id} 
              id={block.id} 
              isSelected={selectedId === block.id}
              onDelete={preview ? undefined : () => onDelete(block.id)}
              onClick={() => !preview && onSelect(block.id)}
            >
              <Component 
                data={block.data} 
                preview={preview}
                onChange={(newData: any) => !preview && onUpdate(block.id, newData)} 
              />
            </SortableBlock>
          );
        })}
      </SortableContext>
    </Box>
  );
};
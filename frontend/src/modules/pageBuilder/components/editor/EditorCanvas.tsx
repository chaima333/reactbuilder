import React from "react";
import { Box, Typography, Button } from "@mui/material";
import { BlockRenderer } from "./BlockRenderer";
import { useDroppable } from "@dnd-kit/core";
import { Block, ValidationError } from "../../types/page.types";

interface EditorCanvasProps {
  blocks: Block[]; 
  registry: any;
  preview?: boolean;
  onUpdate: (id: string, data: any) => void;
  onDelete: (id: string) => void;
  onSelect: (id: string) => void;
  selectedId: string | null;
  activeId: string | null;
  hoverData: any;
  tokens?: any;
  onDuplicate: (id: string) => void;
  hoveredId: string | null;
  device: "mobile" | "desktop" | "tablet";
  errors: ValidationError[]; 
}

export const EditorCanvas = ({
  blocks = [],
  registry,
  onUpdate,
  onDelete,
  onSelect,
  selectedId,
  device,
  activeId,
  hoverData,
  onDuplicate,
  hoveredId,
  errors = [], 
}: EditorCanvasProps) => {

  const { setNodeRef, isOver } = useDroppable({
    id: "canvas-root",
    data: { isRoot: true }
  });

  return (
    <Box 
      ref={setNodeRef}
      sx={{ 
        p: 4, 
        minHeight: "100vh",
        backgroundColor: isOver ? "rgba(25, 118, 210, 0.03)" : "#f9f9f9", 
        transition: "all 0.2s ease",
        position: "relative",
        flex: 1,
        overflowY: "auto"
      }}
    >
      {(!blocks || blocks.length === 0) ? (
        <Box
          sx={{
            height: "400px",
            border: "2px dashed #ccc",
            borderRadius: 4,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 2,
            opacity: 0.6,
            backgroundColor: isOver ? "rgba(25, 118, 210, 0.05)" : "white",
            borderColor: isOver ? "primary.main" : "#ccc",
            transition: "all 0.3s ease",
            "&:hover": { borderColor: "primary.main", bgcolor: "rgba(0,0,0,0.01)" }
          }}
        >
          <Typography variant="h6" color={isOver ? "primary.main" : "text.secondary"}>
            {isOver ? "Drop to add block" : "Your canvas is empty"}
          </Typography>
          <Typography variant="body2" color="text.disabled">
            Drag and drop components from the left sidebar
          </Typography>
        </Box>
      ) : (
        <Box sx={{ 
          maxWidth: device === 'mobile' ? '400px' : device === 'tablet' ? '768px' : '100%', 
          margin: '0 auto', 
          transition: 'max-width 0.3s ease' 
        }}>
          {blocks.map((block: Block) => { 
            
            // 🛡️ Fallback Logic: Resilience Check
            const isUnknown = !registry[block.type];

            if (isUnknown) {
              return (
                <Box 
                  key={block.id}
                  sx={{ 
                    p: 2, my: 1, 
                    border: '2px dashed #f44336', 
                    borderRadius: 2, 
                    bgcolor: 'rgba(244, 67, 54, 0.05)',
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                  }}
                >
                  <Box>
                    <Typography variant="subtitle2" color="error" fontWeight="bold">
                      ⚠️ Unknown Component: "{block.type}"
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Registry mismatch. This block cannot be rendered.
                    </Typography>
                  </Box>
                  <Button 
                    size="small" 
                    color="error" 
                    variant="outlined"
                    onClick={() => onDelete(block.id)}
                  >
                    Delete
                  </Button>
                </Box>
              );
            }

            return (
              <BlockRenderer
                key={block.id}
                block={block}
                registry={registry}
                device={device}
                onUpdate={onUpdate}
                onDelete={onDelete}
                onSelect={onSelect}
                selectedId={selectedId}
                activeId={activeId}
                hoverData={hoverData}
                onDuplicate={onDuplicate}
                hoveredId={hoveredId}
                errors={errors} 
              />
            );
          })}
        </Box>
      )}
    </Box>
  );
};
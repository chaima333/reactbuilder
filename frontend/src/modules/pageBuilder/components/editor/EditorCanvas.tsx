// src/modules/pageBuilder/components/editor/EditorCanvas.tsx
import React from "react";
import { Box, Typography, Button } from "@mui/material";
import { useDroppable } from "@dnd-kit/core";
import { Block, ValidationError } from "../../types/page.types";
import { EditorBlockRenderer } from "../../runtime/renderer/EditorBlockRenderer";
import { VirtualOverlayLayer } from "../../runtime/renderer/VirtualOverlayLayer";
import { RuntimeProvider } from "../../runtime/context/RuntimeProvider";
import { validateTreeInvariants } from "../../runtime/validation/invariants";

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
export const VIRTUAL_ROOT_ID =
  "pb-runtime-root";

  
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
  const invariantReport = React.useMemo(
    () => validateTreeInvariants(blocks || []),
    [blocks]
  );

  const { setNodeRef, isOver } = useDroppable({
    id: VIRTUAL_ROOT_ID,
    data: { isRoot: true }
  });

  return (
    <RuntimeProvider value={{ mode: "editor", device }}>
    <Box ref={setNodeRef} id="pb-runtime-root" data-droppable-container="true"
     data-block-type="root"
     sx={{
    px: 2,
    py: 4,

    display: "flex",
    justifyContent: "center",

    minHeight: "100vh",

    backgroundColor:
      isOver
        ? "rgba(25, 118, 210, 0.03)"
        : "#f9f9f9",

    transition: "all 0.2s ease",

    position: "relative",

    flex: 1,

    overflow: "visible"
  }}
>
        {!invariantReport.valid ? (
          <Box
            sx={{
              width: "100%",
              p: 2,
              border: "1px solid #ef4444",
              bgcolor: "#fef2f2",
              color: "#991b1b"
            }}
          >
            <Typography variant="subtitle2" fontWeight="bold">
              Invalid canonical tree
            </Typography>
            {invariantReport.violations.map((violation) => (
              <Typography key={`${violation.code}-${violation.path}`} variant="caption" display="block">
                {violation.path}: {violation.message}
              </Typography>
            ))}
          </Box>
        ) : (!blocks || blocks.length === 0) ? (
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
         <Box
  id="pb-virtual-canvas-root"
  sx={{
    width: "100%",

    maxWidth:
      device === "mobile"
        ? "420px"
        : device === "tablet"
        ? "1100px"
        : "1400px",

    margin: "0 auto",

    transition:
      "max-width 0.3s ease",

    position: "relative"
  }}
>
            {blocks.map((block: Block) => { 
              
              const registryEntry = registry[block.type];
              const isUnknown = !registryEntry;

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
                <EditorBlockRenderer
                  key={block.id}
                  block={block}
                  component={registryEntry.component} 
                  device={device}
                  selectedId={selectedId}
                  activeId={activeId}
                  hoveredId={hoveredId}
                  // 👑 تمرير الـ الـ داتا كاملة ومفصلة لضمان التفاعل الآمن والـ الـ Nesting الصّح
                  hoverData={{
                    ...hoverData,
                    currentOverId: hoverData?.overId,
                    currentDropPosition: hoverData?.dropPosition,
                    isAllowed: hoverData?.isAllowed
                  }}
                  errors={errors}
                  onUpdate={onUpdate}
                  onDelete={onDelete}
                  onDuplicate={onDuplicate}
                  onSelect={onSelect}
                  onTransform={(id) => {
                    onSelect(id);
                  }}
                />
              );
            })}

            {/* 👑 الـ Virtual Overlay Layer الطائر */}
            <VirtualOverlayLayer
              activeId={activeId}
              overId={hoverData?.overId || null}
              dropPosition={hoverData?.dropPosition || null}
              selectedId={selectedId}
              hoveredId={hoveredId}
              blocks={blocks}
              device={device}
            />
          </Box>
        )}
      </Box>
    </RuntimeProvider>
  );
};

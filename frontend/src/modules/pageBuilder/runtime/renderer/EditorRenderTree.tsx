// src/modules/pageBuilder/runtime/render/EditorRenderTree.tsx

import React from "react";
import type { Block, ValidationError, Device } from "../../types/page.types";
import { EditorBlockRenderer } from "./EditorBlockRenderer";

interface EditorRenderTreeProps {
  blocks: Block[];
  registry: any;
  device?: Device;
  selectedId: string | null;
  activeId: string | null;
  hoveredId: string | null;
  hoverData: any;
  errors: ValidationError[];
  onUpdate: (id: string, data: any) => void;
  onDelete: (id: string) => void;
  onDuplicate: (id: string) => void;
  onSelect: (id: string) => void;
  onTransform?: (id: string) => void;
  onHoverChange?: (id: string | null) => void;
}

export const EditorRenderTree = ({ 
  blocks, 
  registry,
  device = "desktop",
  selectedId,
  activeId,
  hoveredId,
  hoverData,
  errors = [],
  onUpdate,
  onDelete,
  onDuplicate,
  onSelect,
  onTransform,
  onHoverChange
}: EditorRenderTreeProps) => {

  if (!blocks || !blocks.length) {
    return null;
  }

  return (
    <>
      {blocks.map((block) => {
        const registryEntry = registry[block.type];
        
        if (!registryEntry) return null;

        return (
          <EditorBlockRenderer
            key={block.id}
            block={block}
            component={registryEntry.component} // 👈 الـ Component النظيف الموحد
            device={device}
            selectedId={selectedId}
            activeId={activeId}
            hoveredId={hoveredId}
            hoverData={hoverData}
            errors={errors}
            onUpdate={onUpdate}
            onDelete={onDelete}
            onDuplicate={onDuplicate}
            onSelect={onSelect}
            onTransform={onTransform}
            onHoverChange={onHoverChange}
          >
            {block.children && block.children.length > 0 && (
              <EditorRenderTree
                blocks={block.children}
                registry={registry}
                device={device}
                selectedId={selectedId}
                activeId={activeId}
                hoveredId={hoveredId}
                hoverData={hoverData}
                errors={errors}
                onUpdate={onUpdate}
                onDelete={onDelete}
                onDuplicate={onDuplicate}
                onSelect={onSelect}
                onTransform={onTransform}
                onHoverChange={onHoverChange}
              />
            )}
          </EditorBlockRenderer>
        );
      })}
    </>
  );
};

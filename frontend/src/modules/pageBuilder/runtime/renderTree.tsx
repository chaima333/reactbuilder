// src/modules/pageBuilder/runtime/renderTree.tsx
import React from "react";
import { blockRegistry } from "../core/blockRegistry";

interface RenderTreeProps {
  blocks: any[];
  device: "desktop" | "tablet" | "mobile";
}

export const RenderTree: React.FC<RenderTreeProps> = ({ blocks, device }) => {
  if (!blocks || !blocks.length) return null;

  return (
    <>
      {blocks.map((block) => {
        const config = blockRegistry[block.type];
        
        if (!config) {
          return <div key={block.id}>Unknown Block: {block.type}</div>;
        }

        const Component = config.component;

        return (
          <Component
            key={block.id}
            id={block.id}
            data={block.data}
            device={device}
          >
            {/* 3. الـ Recursion للأطفال: نمرروا الـ device للأبناء زادة */}
            {block.children && block.children.length > 0 && (
              <RenderTree blocks={block.children} device={device} />
            )}
          </Component>
        );
      })}
    </>
  );
};

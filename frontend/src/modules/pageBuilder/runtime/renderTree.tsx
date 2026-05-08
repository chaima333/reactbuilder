// src/modules/pageBuilder/runtime/renderTree.tsx
import React from "react";
import { blockRegistry } from "../core/blockRegistry";
import { resolveBlockStyles } from "./resolveStyles";
import { useTheme } from "../core/theme/ThemeProvider";

interface RenderTreeProps {
  blocks: any[];
  device: "desktop" | "tablet" | "mobile";
  // نحينا الـ tokens من الـ Props هنا خاطرنا باش نجيبوها مالـ Context داخلياً
}

export const RenderTree: React.FC<RenderTreeProps> = ({ blocks, device }) => {
  // 1. جلب الـ Tokens من الـ Context (مرة واحدة للأب)
  const { tokens } = useTheme(); 

  if (!blocks || !blocks.length) return null;

  return (
    <>
      {blocks.map((block) => {
        const config = blockRegistry[block.type];
        
        if (!config) {
          return <div key={block.id}>Unknown Block: {block.type}</div>;
        }

        // 2. تحويل الستايل لـ CSS نقي باستعمال الـ Resolver
        const resolvedStyles = resolveBlockStyles(block.data?.style, device, tokens);

        const Component = config.component;

        return (
          <Component
            key={block.id}
            id={block.id}
            {...block.data?.props}   // نبعثوا الـ content (text, url, label...)
            styles={resolvedStyles}  // نبعثوا الـ Resolved CSS
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
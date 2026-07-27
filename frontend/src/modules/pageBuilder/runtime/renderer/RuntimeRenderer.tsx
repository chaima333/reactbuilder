// src/modules/pageBuilder/runtime/render/RuntimeRenderer.tsx

import React from "react";

import {
  blockRegistry
} from "../../core/blockRegistry";

import type {
  Block,
  Device,
  BlockRendererProps
} from "../../types/page.types";

// =========================
// Props
// =========================

interface RuntimeRendererProps {
  block: Block;
  device: Device;
  children?: React.ReactNode;
  context?: any;
}

// =========================
// Runtime Renderer
// =========================

export const RuntimeRenderer = ({
  block,
  device,
  children,
  context
}: RuntimeRendererProps) => {

  const config =
    blockRegistry[
      block.type
    ];

  if (!config) {
    return null;
  }

  const Component =
    config.component as React.ComponentType<
      BlockRendererProps & {
        children?: React.ReactNode;
      }
    >;

  // توليد children من block.children
  const renderChildren = () => {
    if (!block.children || block.children.length === 0) {
      return null;
    }

    return block.children.map((child: Block, index: number) => (
      <RuntimeRenderer
        key={child.id || index}
        block={child}
        device={device}
        context={context}
      />
    ));
  };

  // استخدم children من props إذا وجدت، وإلا استخدم renderChildren
  const childNodes = children || renderChildren();

  return (
    <Component
      block={block}
      data={block.data}
      device={device}
    >
      {childNodes}
    </Component>
  );
};
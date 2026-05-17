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
}

// =========================
// Runtime Renderer
// =========================

export const RuntimeRenderer = ({
  block,
  device,
  children
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

  // ✅ Pure Runtime Rendering
  // No overlays
  // No editor chrome
  // No hover logic

  return (

    <Component
      data={block.data}
      device={device}
    >

      {children}

    </Component>
  );
};
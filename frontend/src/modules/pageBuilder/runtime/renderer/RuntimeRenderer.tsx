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

  console.error(
    "❌ MISSING BLOCK CONFIG",
    block.type,
    block
  );

  return null;
}

  const Component =
    config.component as React.ComponentType<
      BlockRendererProps & {
        children?: React.ReactNode;
      }
    >;
const blockText =
  block?.data?.props?.text ||
  block?.data?.props?.content ||
  block?.data?.props?.label;

if (
  blockText === "Healthcare Services" ||
  blockText === "Our Impact" ||
  block?.id?.includes("services") ||
  block?.id?.includes("impact")
) {
  console.log("TARGET_BLOCK_TRACE", {
    id: block?.id,
    type: block?.type,
    text: blockText,
    style: block?.data?.style,
    children: block?.children?.map((child: any) => ({
      id: child.id,
      type: child.type,
      text:
        child?.data?.props?.text ||
        child?.data?.props?.content ||
        child?.data?.props?.label,
      style: child?.data?.style
    }))
  });
}
  return (

    <Component
     block={block}
      data={block.data}
      device={device}
    >
    {children}
    </Component>
  );
};
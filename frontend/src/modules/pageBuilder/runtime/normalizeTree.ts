import { Block } from "../types/page.types";
import { blockRegistry } from "../core/blockRegistry";


export const normalizeBlock = (block: any): Block => {
  const config = blockRegistry[block.type as string];

  if (!config) return block;

  return {
    ...block,
    id: block.id || crypto.randomUUID(), // ضمان وجود ID
    children: normalizeTree(block.children || []), // تنظيف الأبناء تكرارياً
    data: {
      props: {
        ...(config.defaultData?.props || {}),
        ...(block.data?.props || {}),
      },
      style: {
        desktop: {
          ...(config.defaultData?.style?.desktop || {}),
          ...(block.data?.style?.desktop || {}),
        },
        tablet: {
          ...(config.defaultData?.style?.tablet || {}),
          ...(block.data?.style?.tablet || {}),
        },
        mobile: {
          ...(config.defaultData?.style?.mobile || {}),
          ...(block.data?.style?.mobile || {}),
        },
      },
    },
  };
};


export const normalizeTree = (blocks: any[]): Block[] => {
  if (!Array.isArray(blocks)) return [];
  return blocks.map(normalizeBlock);
};
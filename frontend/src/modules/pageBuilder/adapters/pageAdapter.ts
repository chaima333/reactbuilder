import { Block, ResponsiveStyle } from "../types/page.types";
import { blockRegistry } from "../core/blockRegistry";
export { canDrop } from "../core/validation/canDrop";

/**
 * الـ APIBlock يمثل الداتا الخام اللي جاية من السيرفر
 */
export type LegacyBlockInput = {
  id?: string;
  type: string;
  data?: {
    props?: Record<string, any>;
    style?: any; // نجم يكون Object عادي أو ResponsiveStyle
  };
  props?: Record<string, any>;
  style?: any;
  children?: LegacyBlockInput[];
};

/**
 * Helper function باش نضمنوا إن الـ Style ديما يرجع ResponsiveStyle
 */
const ensureResponsiveStyle = (style: any): ResponsiveStyle => {
  if (style?.desktop) {
    return style as ResponsiveStyle;
  }
  return {
    desktop: style || {},
    tablet: {},
    mobile: {}
  };
};

export const normalizeBlock = (block: LegacyBlockInput): Block => {
  if (!block?.id) throw new Error("Block missing id");
  if (!block?.type) throw new Error(`Block ${block.id} missing type`);

  const props = block.data?.props || block.props || (block.data && !block.data.props ? block.data : {});
  const style = ensureResponsiveStyle(block.data?.style || block.style);

  return {
    id: block.id,
    type: block.type as any,
    data: {
      props,
      style
    },
    children: normalizeBlocks(block.children || [])
  };
};

export const normalizeBlocks = (blocks: LegacyBlockInput[] = []): Block[] => {
  return (blocks || []).map(normalizeBlock);
};

export const fromAPIToUI = (blocks: LegacyBlockInput[]): Block[] => {
  return normalizeBlocks(blocks);
};

export const fromUIToAPI = (blocks: Block[]): LegacyBlockInput[] => {
  const walk = (nodes: Block[]): LegacyBlockInput[] => {
    return nodes.map((b) => {
      if (!blockRegistry[b.type]) {
        throw new Error(`Block not registered: ${b.type}`);
      }

      return {
        id: b.id,
        type: b.type,
        data: {
          props: b.data.props,
          style: b.data.style
        },
        children: b.children?.length ? walk(b.children) : []
      };
    });
  };

  return walk(blocks);
};

export const adaptPageResponse = (page: any) => {
  if (!page) return null;
  return {
    ...page,
    blocks: fromAPIToUI(page.blocks || [])
  };
};

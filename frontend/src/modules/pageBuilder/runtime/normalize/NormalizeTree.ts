import { normalizeBlock, type LegacyBlockInput } from "../../adapters/pageAdapter";
import { blockRegistry } from "../../core/blockRegistry";
import { Block } from "../../types/page.types";

const withIdentity = (block: LegacyBlockInput): LegacyBlockInput => ({
  ...block,
  id: block.id || crypto.randomUUID(),
  children: (block.children || []).map(withIdentity)
});

export const hydrateBlock = (input: LegacyBlockInput): Block => {
  const block = normalizeBlock(withIdentity(input));
  const config = blockRegistry[block.type];

  if (!config) {
    return block;
  }

  return {
    ...block,
    data: {
      props: {
        ...(config.defaultData?.props || {}),
        ...block.data.props
      },
      style: {
        desktop: {
          ...(config.defaultData?.style?.desktop || {}),
          ...(block.data.style?.desktop || {})
        },
        tablet: {
          ...(config.defaultData?.style?.tablet || {}),
          ...(block.data.style?.tablet || {})
        },
        mobile: {
          ...(config.defaultData?.style?.mobile || {}),
          ...(block.data.style?.mobile || {})
        }
      }
    },
    children: hydrateTree(block.children)
  };
};

export const hydrateTree = (blocks: LegacyBlockInput[] = []): Block[] => {
  if (!Array.isArray(blocks)) return [];
  return blocks.map(hydrateBlock);
};

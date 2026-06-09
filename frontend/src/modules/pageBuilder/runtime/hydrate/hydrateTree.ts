import {
  normalizeBlock,
  type LegacyBlockInput
} from "../../adapters/pageAdapter";

import {
  blockRegistry
} from "../../core/blockRegistry";

import type {
  Block
} from "../../types/page.types";

// =====================================================
// HYDRATE BLOCK
// =====================================================

export const hydrateBlock = (
  input: LegacyBlockInput
): Block => {

  const block =
    normalizeBlock(input);

  const config =
    blockRegistry[
      block.type
    ];

  // =====================================
  // UNKNOWN BLOCK
  // =====================================

  if (!config) {
    return block;
  }

  // =====================================
  // HYDRATED BLOCK
  // =====================================

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

    children:
      hydrateTree(
        block.children
      )
  };
};

// =====================================================
// HYDRATE TREE
// =====================================================

export const hydrateTree = (
  blocks:
    LegacyBlockInput[] = []
): Block[] => {

  if (
    !Array.isArray(blocks)
  ) {

    return [];
  }

  return blocks.map(
    hydrateBlock
  );
};
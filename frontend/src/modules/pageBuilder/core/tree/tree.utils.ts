import { v4 as uuidv4 } from "uuid";
import { Block, BlockType } from "../../types/page.types";

/**
 * 🔥 Traverse + update a block anywhere in a nested tree
 */
export const updateBlockInTree = (
  blocks: Block[],
  blockId: string,
  updater: (block: Block) => Block
): Block[] => {
  return blocks.map((block) => {

    if (block.id === blockId) {
      return updater(block);
    }

    if (block.children?.length) {
      return {
        ...block,
        children: block.children.map((col) =>
          updateBlockInTree(col, blockId, updater)
        )
      };
    }

    return block;
  });
};

/**
 * ➕ Add block inside a specific column (section system)
 */

export const addBlockToColumn = (
  blocks: Block[],
  sectionId: string,
  columnIndex: number,
  newType: BlockType,
  registry: any
): Block[] => {
  return blocks.map((block) => {

    if (block.id === sectionId) {
      const config = registry?.[newType];
      if (!config) return block;

      const newBlock: Block = {
        id: uuidv4(),
        type: newType as BlockType,
        data: {
          props: { ...config.defaultData?.props },
          style: { ...config.defaultData?.style }
        }
      };

      const children = block.children || [];

      const updated = [...children];
      updated[columnIndex] = [
        ...(updated[columnIndex] || []),
        newBlock
      ];

      return {
        ...block,
        children: updated
      };
    }

    if (block.children?.length) {
      return {
        ...block,
        children: block.children.map((col) =>
          addBlockToColumn(col, sectionId, columnIndex, newType, registry)
        )
      };
    }

    return block;
  });
};

/**
 * 🗑 Delete block anywhere in tree
 */
export const deleteBlockFromTree = (
  blocks: Block[],
  blockId: string
): Block[] => {
  return blocks
    .filter((b) => b.id !== blockId)
    .map((block) => {

      if (block.children?.length) {
        return {
          ...block,
          children: block.children.map((col) =>
            deleteBlockFromTree(col, blockId)
          )
        };
      }

      return block;
    });
};

/**
 * 📦 Utility: find block anywhere (for inspector selection later)
 */
export const findBlockInTree = (
  blocks: Block[],
  blockId: string
): Block | null => {
  for (const block of blocks) {

    if (block.id === blockId) return block;

    if (block.children?.length) {
      for (const col of block.children) {
        const found = findBlockInTree(col, blockId);
        if (found) return found;
      }
    }
  }

  return null;
};
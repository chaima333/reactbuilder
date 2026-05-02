import { Block } from "../../types/page.types";

/**
 * 📦 Find block anywhere
 */
export const findBlockInTree = (
  blocks: Block[],
  blockId: string
): Block | null => {
  for (const block of blocks) {
    if (block.id === blockId) return block;

    if (block.children?.length) {
      const found = findBlockInTree(block.children, blockId);
      if (found) return found;
    }
  }

  return null;
};

/**
 * 🔥 Update block anywhere
 */
export const updateBlockInTree = (
  blocks: Block[],
  blockId: string,
  updater: (block: Block) => Block
): Block[] => {
  return blocks.map((block) => {
    if (block.id === blockId) return updater(block);

    if (block.children?.length) {
      return {
        ...block,
        children: updateBlockInTree(block.children, blockId, updater),
      };
    }

    return block;
  });
};

/**
 * 🗑 Delete block anywhere
 */
export const deleteBlockFromTree = (
  blocks: Block[],
  blockId: string
): Block[] => {
  return blocks
    .filter((b) => b.id !== blockId)
    .map((block) => ({
      ...block,
      children: block.children?.length
        ? deleteBlockFromTree(block.children, blockId)
        : [],
    }));
};
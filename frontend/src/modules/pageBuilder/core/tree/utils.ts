import { Block } from "../../types/page.types";


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
 * 🔍 Find parent block anywhere
 */
export const findParentInTree = (
  blocks: Block[],
  childId: string
): Block | null => {
  for (const block of blocks) {
    if (block.children?.some((child) => child.id === childId)) return block;
    if (block.children?.length) {
      const found = findParentInTree(block.children, childId);
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

/**
 * ➕ Add block inside a parent
 */
export const insertBlockAt = (
  blocks: Block[],
  parentId: string,
  newBlock: Block,
  index: number // إجباري
): Block[] => {
  return blocks.map((block) => {
    // 🎯 إذا وصلنا للـ Parent الصحيح
    if (block.id === parentId) {
      const children = [...(block.children || [])];
      
   
      const filteredChildren = children.filter(c => c.id !== newBlock.id);
      
      filteredChildren.splice(index, 0, newBlock);
      
      return { ...block, children: filteredChildren };
    }

    if (block.children?.length) {
      return {
        ...block,
        children: insertBlockAt(block.children, parentId, newBlock, index),
      };
    }
    return block;
  });
};

export const getTotalBlocksCount = (nodes: Block[]): number => {
  let count = 0;
  nodes.forEach((node) => {
    count++;
    if (node.children?.length) {
      count += getTotalBlocksCount(node.children);
    }
  });
  return count;
};
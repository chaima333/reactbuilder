import { v4 as uuidv4 } from "uuid";
import { Block } from "../../types/page.types";

/**
 * 📋 Deep copy
 */
export const copyBlock = (block: Block): Block => {
  return JSON.parse(JSON.stringify(block));
};

/**
 * 🔁 Regenerate IDs
 */
const regenerateIds = (block: Block): Block => {
  const newBlock: Block = {
    ...block,
    id: uuidv4(),
    children: block.children?.map(regenerateIds) || [],
  };

  return newBlock;
};

/**
 * 📌 Duplicate (copy + new ids)
 */
export const duplicateBlock = (block: Block): Block => {
  return regenerateIds(copyBlock(block));
};

/**
 * 📥 Paste into tree
 */
export const pasteBlockIntoTree = (
  blocks: Block[],
  targetId: string,
  newBlock: Block
): Block[] => {
  return blocks.map((block) => {
    if (block.id === targetId) {
      return {
        ...block,
        children: [...(block.children || []), newBlock],
      };
    }

    return {
      ...block,
      children: block.children?.length
        ? pasteBlockIntoTree(block.children, targetId, newBlock)
        : [],
    };
  });
};
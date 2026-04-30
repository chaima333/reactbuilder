import { v4 as uuidv4 } from "uuid";

/**
 * 🔁 Regenerate IDs recursively (CRITICAL)
 */
const regenerateIds = (block: any): any => {
  const newBlock = {
    ...block,
    id: uuidv4()
  };

  if (block.children?.length) {
    newBlock.children = block.children.map((col: any[]) =>
      col.map((child) => regenerateIds(child))
    );
  }

  return newBlock;
};

/**
 * 📋 COPY (deep clone)
 */
export const copyBlock = (block: any): any => {
  return JSON.parse(JSON.stringify(block));
};

/**
 * 📌 DUPLICATE (copy + new IDs)
 */
export const duplicateBlock = (block: any): any => {
  return regenerateIds(copyBlock(block));
};

/**
 * 📥 PASTE INTO TREE
 */
export const pasteBlockIntoTree = (
  blocks: any[],
  targetId: string,
  newBlock: any
): any[] => {

  const insert = (list: any[]): any[] => {
    const result: any[] = [];

    for (const block of list) {

      if (block.id === targetId) {
        result.push(block, newBlock); // after
        continue;
      }

      if (block.children?.length) {
        result.push({
          ...block,
          children: block.children.map((col: any[]) =>
            insert(col)
          )
        });
      } else {
        result.push(block);
      }
    }

    return result;
  };

  return insert(blocks);
};
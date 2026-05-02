import { Block } from "../../types/page.types";

/**
 * 🚀 Move block in tree (before / after / inside)
 */
export const moveBlockInTree = (
  blocks: Block[],
  activeId: string,
  drop: any
): Block[] => {
  const { tree, extracted } = extract(blocks, activeId);

  if (!extracted) return blocks;

  return insert(tree, drop, extracted);
};

/**
 * 🔥 Extract block
 */
const extract = (
  blocks: Block[],
  id: string
): { tree: Block[]; extracted: Block | null } => {
  let extracted: Block | null = null;

  const tree = blocks
    .filter((b) => {
      if (b.id === id) {
        extracted = b;
        return false;
      }
      return true;
    })
    .map((block) => ({
      ...block,
      children: block.children?.length
        ? extract(block.children, id).tree
        : [],
    }));

  return { tree, extracted };
};

/**
 * 📥 Insert block
 */
const insert = (
  blocks: Block[],
  drop: any,
  node: Block
): Block[] => {
  const result: Block[] = [];

  for (const block of blocks) {
    if (block.id === drop.targetId) {
      if (drop.type === "before") result.push(node, block);
      if (drop.type === "after") result.push(block, node);
      if (drop.type === "inside") {
        result.push({
          ...block,
          children: [...(block.children || []), node],
        });
      }
      continue;
    }

    result.push({
      ...block,
      children: block.children?.length
        ? insert(block.children, drop, node)
        : [],
    });
  }

  return result;
};
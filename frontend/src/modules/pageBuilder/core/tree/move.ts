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
): {
  tree: Block[];
  extracted: Block | null;
} => {

  let extracted:
    Block | null = null;

  const tree =
    blocks.flatMap((block) => {

      // 🎯 Found target
      if (block.id === id) {

        extracted = block;

        return [];
      }

      // 🔁 Recursive extraction
      const childResult =
        extract(
          block.children || [],
          id
        );

      // ✅ Preserve extracted node
      if (
        childResult.extracted
      ) {

        extracted =
          childResult.extracted;
      }

      return [{

        ...block,

        children:
          childResult.tree,
      }];
    });

  return {
    tree,
    extracted,
  };
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
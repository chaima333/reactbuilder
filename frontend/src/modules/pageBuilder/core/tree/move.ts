import { Block } from "../../types/page.types";

/**
 * 🚀 Move block in tree
 */
export const moveBlockInTree = (
  blocks: Block[],
  activeId: string,
  drop: any
): Block[] => {

  const {
    tree,
    extracted
  } = extract(
    blocks,
    activeId
  );

  if (!extracted) {
    return blocks;
  }

  // 👑 semantic wrapper injection
  let node = extracted;

  if (drop.wrapperType) {

    node = {
      id: crypto.randomUUID(),

      type:
        drop.wrapperType,

      data: {
        props: {},
        style: {
          desktop: {}
        }
      },

      children: [extracted]
    };
  }

  return insert(
    tree,
    drop,
    node
  );
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

      // 🎯 found target
      if (block.id === id) {

        extracted = block;

        return [];
      }

      // 🔁 recursive
      const childResult =
        extract(
          block.children || [],
          id
        );

      if (
        childResult.extracted
      ) {

        extracted =
          childResult.extracted;
      }

      return [{

        ...block,

        children:
          childResult.tree
      }];
    });

  return {
    tree,
    extracted
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
  
  const walk = (items: Block[]): Block[] => {
    // 1. نبحث عن موقع الـ targetId في المستوى الحالي
    const targetIndex = items.findIndex(b => b.id === drop.targetId);

    if (targetIndex !== -1) {
      const newItems = [...items];
      
      if (drop.position  === "inside") {
        // حالة الـ Inside: إضافة داخل الـ Children
        const targetBlock = { ...newItems[targetIndex] };
        const children = [...(targetBlock.children || [])];
        children.splice(drop.index ?? children.length, 0, node);
        newItems[targetIndex] = { ...targetBlock, children };
        return newItems;
      } 
      
      // حالة الـ Before أو After: الإضافة في نفس مستوى الأب
      if (drop.position  === "before") {
        newItems.splice(targetIndex, 0, node);
        return newItems;
      } 
      
      if (drop.position  === "after") {
        newItems.splice(targetIndex + 1, 0, node);
        return newItems;
      }
    }

    // 2. إذا لم نجده في المستوى الحالي، ننتقل للأبناء (Recursion)
    return items.map(block => ({
      ...block,
      children: block.children ? walk(block.children) : []
    }));
  };

  // معالجة حالة الـ ROOT
  if (drop.targetId === "ROOT" || drop.targetId === "canvas-root") {
    const result = [...blocks];
    result.splice(drop.index ?? result.length, 0, node);
    return result;
  }

  return walk(blocks);
};
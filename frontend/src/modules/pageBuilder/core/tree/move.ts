import { Block } from "../../types/page.types";
import { canDrop } from "../validation/canDrop";

/**
 * 🔍 find target block
 */
const findTarget = (
  blocks: Block[],
  id: string
): Block | null => {

  for (const block of blocks) {

    if (block.id === id) {
      return block;
    }

    const found =
      findTarget(
        block.children || [],
        id
      );

    if (found) {
      return found;
    }
  }

  return null;
};

/**
 * 🚀 Move block in tree
 */
export const moveBlockInTree = (
  blocks: Block[],
  activeId: string,
  drop: any
): Block[] => {

  const movingBlock =
  findTarget(
    blocks,
    activeId
  );

if (!movingBlock) {
  return blocks;
}

const targetBlock =
  findTarget(
    blocks,
    drop.targetId
  );

if (
  targetBlock &&
  drop.position === "inside" &&
  !canDrop(
    targetBlock.type,
    movingBlock.type
  )
) {

  console.warn(
    "INVALID MOVE"
  );

  return blocks;
}

// 👑 ONLY NOW EXTRACT

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

  // 👑 SAFE INDEX NORMALIZATION
  const safeDrop = {
    ...drop
  };

  if (
    typeof safeDrop.index ===
    "number"
  ) {

    const originalTarget =
  findTarget(
    blocks,
    safeDrop.targetId
  );

    const target =
  originalTarget;

    const childrenCount =
      target?.children
        ?.length || 0;

    safeDrop.index =
      Math.max(
        0,
        Math.min(
          safeDrop.index,
          childrenCount
        )
      );
  }

  console.log(
    "MOVE BLOCK",
    {
      activeId,
      safeDrop
    }
  );

  const result =
  insert(
    tree,
    safeDrop,
    node
  );

if (!result.inserted) {

  console.warn(
    "MOVE INSERT FAILED"
  );

  return blocks;
}


return result.tree;
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

  const next = blocks.reduce<
    Block[]
  >(
    (
      acc,
      block
    ) => {

      // 👑 FOUND TARGET
      if (
        block.id === id
      ) {

        extracted = block;

        return acc;
      }

      // 👑 RECURSIVE
      if (
        block.children &&
        block.children.length
      ) {

        const result =
          extract(
            block.children,
            id
          );

        if (
          result.extracted
        ) {

          extracted =
            result.extracted;

          acc.push({

            ...block,

            children:
              result.tree
          });

          return acc;
        }
      }

      // 👑 KEEP BLOCK
      acc.push(block);

      return acc;
    },

    []
  );

  return {
    tree: next,
    extracted
  };
};

/**
 * 
 * 📥 Insert block
 */


const insert = (
  blocks: Block[],
  drop: any,
  node: Block
): {
  tree: Block[];
  inserted: boolean;
} => {

  const walk = (
    items: Block[]
  ): {
    tree: Block[];
    inserted: boolean;
  } => {

    let inserted = false;

    const next =
      items.flatMap(
        (block) => {

          // =====================
          // TARGET FOUND
          // =====================

          if (
            block.id ===
            drop.targetId
          ) {

            inserted = true;

            // =====================
            // INSIDE
            // =====================

            if (
              drop.position ===
              "inside"
            ) {

              const children = [
                ...(block.children || [])
              ];

              const safeIndex =
                typeof drop.index ===
                "number"
                  ? Math.max(
                      0,
                      Math.min(
                        drop.index,
                        children.length
                      )
                    )
                  : children.length;

              children.splice(
                safeIndex,
                0,
                node
              );

              return [{

                ...block,

                children
              }];
            }

            // =====================
            // BEFORE
            // =====================

            if (
              drop.position ===
              "before"
            ) {

              return [

                node,

                {
                  ...block
                }
              ];
            }

            // =====================
            // AFTER
            // =====================

            if (
              drop.position ===
              "after"
            ) {

              return [

                {
                  ...block
                },

                node
              ];
            }
          }

          // =====================
          // RECURSIVE
          // =====================

          if (
            block.children &&
            block.children.length
          ) {

            const result =
              walk(
                block.children
              );

            if (
              result.inserted
            ) {

              inserted = true;

              return [{

                ...block,

                children:
                  result.tree
              }];
            }
          }

          // =====================
          // KEEP BLOCK
          // =====================

          return [{

            ...block
          }];
        }
      );

    return {
      tree: next,
      inserted
    };
  };

  // =========================
  // ROOT INSERTION
  // =========================

  if (
    drop.targetId ===
      "ROOT" ||
    drop.targetId ===
      "canvas-root"
  ) {

    const result =
      [...blocks];

    const safeIndex =
      typeof drop.index ===
      "number"
        ? Math.max(
            0,
            Math.min(
              drop.index,
              result.length
            )
          )
        : result.length;

    result.splice(
      safeIndex,
      0,
      node
    );

    return {
      tree: result,
      inserted: true
    };
  }

  // =========================
  // FINAL WALK
  // =========================

  return walk(blocks);
};
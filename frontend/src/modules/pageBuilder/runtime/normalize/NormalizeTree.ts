import type {
  Block
} from "../../types/page.types";

// =====================================================
// PRIMITIVE LEAF BLOCKS
// =====================================================

const primitiveTypes = new Set([
  "title",
  "text",
  "image",
  "button"
]);

// =====================================================
// EMPTY WRAPPER FACTORY
// =====================================================

const createEmptyWrapper = (
  id: string,
  type: "flexItem" | "gridItem",
  child: Block
): Block => ({

  id,

  type,

  data: {

    props: {},

    style: {

      desktop: {},

      tablet: {},

      mobile: {}
    }
  },

  children: [child]
});

// =====================================================
// NORMALIZE TREE
// =====================================================

export const normalizeTree = (
  blocks: Block[] = []
): Block[] => {

  if (!Array.isArray(blocks)) {

    return [];
  }

  return blocks.map(
    normalizeBlock
  );
};

// =====================================================
// NORMALIZE BLOCK
// =====================================================

const normalizeBlock = (
  block: Block
): Block => {

 if (block.type === "gridItem") {
  console.log(
    "🔥 GRIDITEM STYLE",
    block.id,
    JSON.stringify(
      block.data?.style,
      null,
      2
    )
  );
}

  // =====================================
  // RECURSIVE NORMALIZATION
  // =====================================

  let children =

    (block.children || [])
      .map(normalizeBlock);

  // =====================================
  // FLEX → FLEX ITEMS ONLY
  // =====================================

  if (

    block.type === "flex" ||

    block.type === "navbar"
  ) {

    children =

      children.map(
        (child, index) => {

          // =================================
          // KEEP VALID CONTAINERS
          // =================================

          if (

            child.type ===
              "flexItem"

            ||

            !primitiveTypes.has(
              child.type
            )
          ) {

            return child;
          }

          // =================================
          // WRAP PRIMITIVES ONLY
          // =================================

          return createEmptyWrapper(

            `${block.id}-flex-item-${index}`,

            "flexItem",

            child
          );
        }
      );
  }

  // =====================================
  // GRID → GRID ITEMS ONLY
  // =====================================

  if (
    block.type === "grid"
  ) {

    children =

      children.map(
        (child, index) => {

          // =================================
          // KEEP VALID CONTAINERS
          // =================================

          if (

            child.type ===
              "gridItem"

            ||

            !primitiveTypes.has(
              child.type
            )
          ) {

            return child;
          }

          // =================================
          // WRAP PRIMITIVES ONLY
          // =================================

          return createEmptyWrapper(

            `${block.id}-grid-item-${index}`,

            "gridItem",

            child
          );
        }
      );
  }

  // =====================================
  // PRIMITIVES ARE LEAFS
  // =====================================

  if (
    primitiveTypes.has(
      block.type
    )
  ) {

    children = [];
  }

  // =====================================
  // RETURN NORMALIZED BLOCK
  // =====================================

  return {

    ...block,

    children
  };
};
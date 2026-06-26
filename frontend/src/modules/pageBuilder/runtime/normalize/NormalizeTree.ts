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
  "button",
   "link",
  "input",
  "select",
  "textarea",

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

  return blocks
    .map(normalizeBlock)
    .map((block, index) => {
      if (
        block.type === "flex" ||
        block.type === "grid"
      ) {
        return {
          id: `section-auto-root-${index}`,
          type: "section",
          data: {
            props: {},
            style: {
              desktop: {},
              tablet: {},
              mobile: {}
            }
          },
          children: [block]
        };
      }

      return block;
    });
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

    block.type === "navbar" ||

    block.type === "footer"
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
// SECTION → NO DIRECT PRIMITIVES
// =====================================

if (block.type === "section") {
  const nextChildren: Block[] = [];
  let primitiveBuffer: Block[] = [];

  const flushPrimitives = () => {
    if (!primitiveBuffer.length) {
      return;
    }

    const index = nextChildren.length;

    nextChildren.push({
      id: `${block.id}-auto-flex-${index}`,
      type: "flex",
      data: {
        props: {},
        style: {
          desktop: {
            flexDirection: "column",
            gap: "8px"
          },
          tablet: {},
          mobile: {}
        }
      },
      children: [
        {
          id: `${block.id}-auto-flex-item-${index}`,
          type: "flexItem",
          data: {
            props: {},
            style: {
              desktop: {},
              tablet: {},
              mobile: {}
            }
          },
          children: primitiveBuffer
        }
      ]
    });

    primitiveBuffer = [];
  };

  children.forEach((child) => {
    if (primitiveTypes.has(child.type)) {
      primitiveBuffer.push(child);
      return;
    }

    flushPrimitives();
    nextChildren.push(child);
  });

  flushPrimitives();

  children = nextChildren;
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

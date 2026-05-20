import { canAcceptChild } from "../../core/schema/canonicalSchema";
import { Block, PageData } from "../../types/page.types";
import { assertTreeInvariants } from "../validation/invariants";
import { Operation } from "./types";

type ExtractResult = {
  extracted: Block | null;
  tree: Block[];
};

const cloneBlock = (block: Block): Block => structuredClone(block);

const findBlock = (blocks: Block[], id: string): Block | null => {
  for (const block of blocks) {
    if (block.id === id) return block;
    const found = findBlock(block.children || [], id);
    if (found) return found;
  }

  return null;
};

const insertBlock = (
  blocks: Block[],
  parentId: string,
  index: number,
  newBlock: Block
): Block[] => {
  if (parentId === "root") {
    return [
      ...blocks.slice(0, index),
      newBlock,
      ...blocks.slice(index)
    ];
  }

  return blocks.map((block) => {
    if (block.id === parentId) {
      const children = block.children || [];

      return {
        ...block,
        children: [
          ...children.slice(0, index),
          newBlock,
          ...children.slice(index)
        ]
      };
    }

    return {
      ...block,
      children: insertBlock(block.children || [], parentId, index, newBlock)
    };
  });
};

const deleteBlock = (blocks: Block[], blockId: string): Block[] => {
  return blocks
    .filter((block) => block.id !== blockId)
    .map((block) => ({
      ...block,
      children: deleteBlock(block.children || [], blockId)
    }));
};

const extractBlock = (blocks: Block[], blockId: string): ExtractResult => {
  let extracted: Block | null = null;

  const tree = blocks.flatMap((block) => {
    if (block.id === blockId) {
      extracted = cloneBlock(block);
      return [];
    }

    const childResult = extractBlock(block.children || [], blockId);

    if (childResult.extracted) {
      extracted = childResult.extracted;

      return [
        {
          ...block,
          children: childResult.tree
        }
      ];
    }

    return [block];
  });

  return { extracted, tree };
};

const updateBlock = (
  blocks: Block[],
  blockId: string,
  updater: (block: Block) => Block
): Block[] => {
  return blocks.map((block) => {
    if (block.id === blockId) {
      return updater(block);
    }

    return {
      ...block,
      children: updateBlock(block.children || [], blockId, updater)
    };
  });
};

const assertOperationCanTarget = (
  blocks: Block[],
  parentId: string,
  child: Block
) => {
  const parent =
    parentId === "root" ? null : findBlock(blocks, parentId);
  const parentType = parent?.type || "root";

  if (!canAcceptChild(parentType, child.type)) {
    throw new Error(
      `Operation rejected: ${parentType} cannot contain ${child.type}.`
    );
  }
};

export const applyOperation = (
  page: PageData,
  operation: Operation
): PageData => {
  assertTreeInvariants(page.blocks);

  let nextBlocks = page.blocks;

  switch (operation.type) {
    case "INSERT_BLOCK": {
      assertOperationCanTarget(
        nextBlocks,
        operation.parentId,
        operation.block
      );
      nextBlocks = insertBlock(
        nextBlocks,
        operation.parentId,
        operation.index,
        cloneBlock(operation.block)
      );
      break;
    }

    case "MOVE_BLOCK": {
      const { extracted, tree } = extractBlock(
        nextBlocks,
        operation.blockId
      );

      if (!extracted) break;

      assertOperationCanTarget(
        tree,
        operation.targetParentId,
        extracted
      );
      nextBlocks = insertBlock(
        tree,
        operation.targetParentId,
        operation.targetIndex,
        extracted
      );
      break;
    }

    case "WRAP_BLOCK": {
      const { extracted, tree } = extractBlock(
        nextBlocks,
        operation.blockId
      );

      if (!extracted) break;

      const wrapper = {
        ...cloneBlock(operation.wrapper),
        children: [extracted]
      };

      nextBlocks = insertBlock(tree, "root", tree.length, wrapper);
      break;
    }

    case "DELETE_BLOCK":
      nextBlocks = deleteBlock(nextBlocks, operation.blockId);
      break;

    case "TRANSFORM_BLOCK":
      nextBlocks = updateBlock(nextBlocks, operation.blockId, () =>
        cloneBlock(operation.nextBlock)
      );
      break;

    case "UPDATE_PROPS":
      nextBlocks = updateBlock(nextBlocks, operation.blockId, (block) => ({
        ...block,
        data: {
          ...block.data,
          props: {
            ...(block.data?.props || {}),
            ...operation.propsPatch
          }
        }
      }));
      break;

    case "UPDATE_STYLE":
      nextBlocks = updateBlock(nextBlocks, operation.blockId, (block) => {
        const style = block.data?.style || {};

        return {
          ...block,
          data: {
            ...block.data,
            style: {
              ...style,
              [operation.device]: {
                ...(style[operation.device] || {}),
                ...operation.stylePatch
              }
            }
          }
        };
      });
      break;
  }

  assertTreeInvariants(nextBlocks);

  return {
    ...page,
    blocks: nextBlocks
  };
};

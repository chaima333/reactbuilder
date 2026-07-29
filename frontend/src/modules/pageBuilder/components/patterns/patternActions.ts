import type {
  Block
} from "../../types/page.types";

import {
  duplicateBlock
} from "../../core/tree/clipboard";

export type PatternInsertActions = {
  addBlockTree: (
    tree: Block,
    targetId?: string,
    position?: string,
    insertIndex?: number
  ) => void;
};

export const canSaveBlockAsPattern = (
  selectedPageBlock: Block | null
) =>
  selectedPageBlock?.type === "section";

export const createIndependentPatternBlock = (
  rootBlock: Block
) =>
  duplicateBlock(rootBlock);

export const insertPatternAtPageEnd = (
  rootBlock: Block,
  actions: PatternInsertActions
) => {
  const duplicated =
    createIndependentPatternBlock(rootBlock);

  actions.addBlockTree(
    duplicated,
    "ROOT",
    "inside"
  );

  return duplicated;
};

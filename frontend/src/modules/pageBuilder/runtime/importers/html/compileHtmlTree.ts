// src/modules/pageBuilder/runtime/importers/html/compileHtmlTree.ts
// LEGACY - OLD PIPELINE - NOT SOURCE OF TRUTH

import { mapElementToBlock } from "./mapElementToBlock";

import type {
  SerializedBlock
} from "../../../types/document/serialized.types";

export const compileHtmlTree = (
  element: Element,
  path: number[] = []
): SerializedBlock | null => {

  // =========================
  // 1️⃣ Map current element
  // =========================

  const block =
    mapElementToBlock(
      element,
      path
    );

  if (!block) {
    return null;
  }

  // =========================
  // 2️⃣ Compile children recursively
  // =========================

const children =
  Array.from(element.children)

    .map(
      (child, index) =>
        compileHtmlTree(
          child,
          [...path, index]
        )
    )

    .filter(
      (
        child
      ): child is SerializedBlock =>
        child !== null
    );

  // =========================
  // 3️⃣ Attach children
  // =========================

  block.children =
    children;

  return block;
};

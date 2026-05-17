// src/modules/pageBuilder/runtime/importers/html/compileHtmlTree.ts
import { mapElementToBlock } from "./mapElementToBlock";
import type { SerializedBlock } from "../../../types/document/serialized.types";

export const compileHtmlTree = (element: Element): SerializedBlock | null => {
  // =========================
  // 1️⃣ Map current element
  // =========================
  const block = mapElementToBlock(element);

  if (!block) {
    return null;
  }

  // =========================
  // 2️⃣ Compile children recursively
  // =========================
  const children = Array.from(element.children)
    .map((child) => compileHtmlTree(child))
    .filter(Boolean) as SerializedBlock[];

  // =========================
  // 3️⃣ Attach children
  // =========================
  block.children = children;

  return block;
};
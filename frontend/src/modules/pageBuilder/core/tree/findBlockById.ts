// src/modules/pageBuilder/core/tree/findBlockById.ts
import type { Block } from "../../types/page.types";

export const findBlockById = (blocks: Block[], id: string): Block | null => {
  for (const block of blocks) {
    if (block.id === id) {
      return block;
    }

    if (block.children?.length) {
      const found = findBlockById(block.children, id);
      if (found) {
        return found;
      }
    }
  }

  return null;
};
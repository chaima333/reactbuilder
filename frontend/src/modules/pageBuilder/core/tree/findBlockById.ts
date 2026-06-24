import type { Block } from "../../types/page.types";

export const findBlockById = (
  blocks: Block[] | undefined,
  id: string | null
): Block | null => {

  if (!Array.isArray(blocks) || !id) {
    return null;
  }

  for (const block of blocks) {

    if (block.id === id) {
      return block;
    }

    if (block.children?.length) {

      const found =
        findBlockById(
          block.children,
          id
        );

      if (found) {
        return found;
      }
    }
  }

  return null;
};
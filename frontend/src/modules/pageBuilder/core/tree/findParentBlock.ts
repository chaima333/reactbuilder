export const findParentBlock = (
  blocks: any[],
  childId: string,
  parent: any = null
): any => {

  for (const block of blocks) {

    if (block.id === childId) {
      return parent;
    }

    if (block.children?.length) {

      const found =
        findParentBlock(
          block.children,
          childId,
          block
        );

      if (found) return found;
    }
  }

  return null;
};
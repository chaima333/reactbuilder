export type DndSlot =
  | "page"
  | "navbar"
  | "footer";

export const canMoveWithinDndSlots = (
  sourceSlot: DndSlot,
  targetSlot: DndSlot,
  targetId?: string
): boolean => {
  if (
    sourceSlot === "page" &&
    targetSlot === "page"
  ) {
    return true;
  }

  if (
    sourceSlot !== targetSlot ||
    sourceSlot === "page" ||
    !targetId
  ) {
    return false;
  }

  return true;
};

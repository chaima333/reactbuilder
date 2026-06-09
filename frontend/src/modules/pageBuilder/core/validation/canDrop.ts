import { blockRegistry } from "../blockRegistry";
import { BlockType } from "../../types/page.types";

export const canDrop = (
  parentType: string,
  childType: string
): boolean => {

  if (parentType === "root") {

    const childConfig =
      blockRegistry[childType];

    return (
      childConfig?.rules
        ?.allowedParents
        ?.includes("root")
      ?? false
    );
  }

  const parentConfig =
    blockRegistry[parentType];

  const childConfig =
    blockRegistry[childType];

  if (
    !parentConfig ||
    !childConfig
  ) {
    return false;
  }

  if (!parentConfig.isContainer) {
    return false;
  }

  // =====================
  // FLEX
  // =====================

  if (parentType === "flex") {
    return childType === "flexItem";
  }

  if (parentType === "flexItem") {

    if (
      childType === "flexItem"
    ) {
      return false;
    }

    return (
      parentConfig.allowedChildren?.includes(
        childType as any
      ) ?? true
    );
  }

  // =====================
  // GRID
  // =====================

  if (parentType === "grid") {
    return childType === "gridItem";
  }

  if (parentType === "gridItem") {

    if (
      childType === "gridItem"
    ) {
      return false;
    }

    return (
      parentConfig.allowedChildren?.includes(
        childType as any
      ) ?? true
    );
  }

  // =====================
  // GENERIC
  // =====================

  const isAllowedByParent =
    parentConfig.allowedChildren?.includes(
      childType as BlockType
    );

  if (!isAllowedByParent) {
    return false;
  }

  const allowedParents =
    childConfig.rules?.allowedParents;

  if (
    allowedParents &&
    !allowedParents.includes(
      parentType as BlockType
    )
  ) {
    return false;
  }

  return true;
};
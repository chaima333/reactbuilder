import { blockRegistry } from "../blockRegistry";
import { BlockType } from "../../types/page.types";

export const canDrop = (parentType: string, childType: string): boolean => {
  // 1. إذا كان الـ Parent هو الـ root، نتحقق فقط من الـ child rules
  if (parentType === "root") {
    const childConfig = blockRegistry[childType as Exclude<BlockType, "root">];
    return childConfig?.rules?.allowedParents?.includes("root") ?? false;
  }

  const parentConfig = blockRegistry[parentType as Exclude<BlockType, "root">];
  const childConfig = blockRegistry[childType as Exclude<BlockType, "root">];
  if (!parentConfig || !childConfig) return false;

  if (!parentConfig.isContainer) return false;

  const isAllowedByParent = parentConfig.allowedChildren?.includes(childType as BlockType);
  if (!isAllowedByParent) return false;
  if (parentType === "flex") {return true;}
  const allowedParents = childConfig.rules?.allowedParents;
  
  if (allowedParents && !allowedParents.includes(parentType as BlockType)) {
    return false;
  }

  
  return true;
};
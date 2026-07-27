import {
  blockRegistry
} from "../blockRegistry";

import type {
  BlockType
} from "../../types/page.types";

export const canDrop = (
  parentType: string,
  childType: string
): boolean => {
  const childConfig =
    blockRegistry[childType];

  if (!childConfig) {
    return false;
  }

  if (parentType === "root") {
    return (
      childConfig.rules
        ?.allowedParents
        ?.includes("root") ??
      false
    );
  }

  const parentConfig =
    blockRegistry[parentType];

  if (
    !parentConfig ||
    !parentConfig.isContainer
  ) {
    return false;
  }

  const allowedChildren =
    parentConfig.rules
      ?.allowedChildren ??
    [];

  return allowedChildren.includes(
    childType as BlockType
  );
};

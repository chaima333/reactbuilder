// src/modules/pageBuilder/core/validation/canDrop.ts

import { blockRegistry }
from "../blockRegistry";

import { BlockType }
from "../../types/page.types";

export const canDrop = (
  parentType: string,
  childType: string
): boolean => {

  const parentConfig =
    blockRegistry[
      parentType as BlockType
    ];

  if (
    !parentConfig ||
    !parentConfig.isContainer
  ) {
    return false;
  }

  const allowed =
    parentConfig.allowedChildren || [];

  return allowed.includes(
    childType as BlockType
  );
};
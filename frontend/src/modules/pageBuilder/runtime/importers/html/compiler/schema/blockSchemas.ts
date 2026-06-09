import {
  COMPILER_BLOCK_TYPES
} from "../compilerBlockTypes";

export const BLOCK_SCHEMA = {

  // =====================
  // LAYOUT
  // =====================

  [COMPILER_BLOCK_TYPES.SECTION]: {

    canHaveChildren:
      true
  },

  [COMPILER_BLOCK_TYPES.FLEX]: {

    canHaveChildren:
      true
  },

  [COMPILER_BLOCK_TYPES.FLEX_ITEM]: {

    canHaveChildren:
      true
  },

  [COMPILER_BLOCK_TYPES.GRID]: {

    canHaveChildren:
      true
  },

  [COMPILER_BLOCK_TYPES.GRID_ITEM]: {

    canHaveChildren:
      true
  },

  [COMPILER_BLOCK_TYPES.NAVBAR]: {

    canHaveChildren:
      true
  },

  // =====================
  // PRIMITIVES
  // =====================

  [COMPILER_BLOCK_TYPES.TITLE]: {

    canHaveChildren:
      false
  },

  [COMPILER_BLOCK_TYPES.TEXT]: {

    canHaveChildren:
      false
  },

  [COMPILER_BLOCK_TYPES.IMAGE]: {

    canHaveChildren:
      false
  },

  [COMPILER_BLOCK_TYPES.BUTTON]: {

    canHaveChildren:
      false
  },

  [COMPILER_BLOCK_TYPES.LINK]: {

    canHaveChildren:
      false
  },

  [COMPILER_BLOCK_TYPES.INPUT]: {

    canHaveChildren:
      false
  },

  [COMPILER_BLOCK_TYPES.SELECT]: {

    canHaveChildren:
      false
  },

  [COMPILER_BLOCK_TYPES.TEXTAREA]: {

    canHaveChildren:
      false
  }
};
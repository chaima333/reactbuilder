import {
  SpacingControl
} from "./semantic/SpacingControl";

import {
  TypographyControl
} from "./semantic/TypographyControl";

import {
  controlRegistry
} from "../controlRegistry";

import type {
  FieldDefinition
} from "../../../types/field.types";

export const resolveControl = (
  field: FieldDefinition
) => {

  // =========================
  // Semantic Controls
  // =========================

  if (
    field.category ===
    "spacing"
  ) {

    return SpacingControl;
  }

  if (
    field.category ===
    "typography"
  ) {

    return TypographyControl;
  }

  // =========================
  // Primitive Fallback
  // =========================

  return controlRegistry[
    field.type
  ];
};
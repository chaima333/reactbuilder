import { BlockConfig }
from "../types/page.types";

// =========================
// LAYOUT
// =========================

import {
  sectionDefinition
} from "../components/blocks/layout/section";

import {
  flexDefinition
} from "../components/blocks/layout/flex";

import {
  flexItemDefinition
} from "../components/blocks/layout/flexItem";

// =========================
// PRIMITIVES
// =========================

import {
  titleDefinition
} from "../components/blocks/primitives/title";

import {
  textDefinition
} from "../components/blocks/primitives/text";

import {
  imageDefinition
} from "../components/blocks/primitives/image";

import {
  buttonDefinition
} from "../components/blocks/primitives/button";

// =========================
// SEMANTIC
// =========================

import {
  heroDefinition,
  ctaDefinition,
  featuresDefinition
} from "../components/blocks/semantic/index";

// =========================
// REGISTRY
// =========================

export const blockRegistry:
Record<string, BlockConfig> = {

  // =====================
  // LAYOUT
  // =====================

  section:
    sectionDefinition,

  flex:
    flexDefinition,

  flexItem:
    flexItemDefinition,

  // =====================
  // PRIMITIVES
  // =====================

  title:
    titleDefinition,

  text:
    textDefinition,

  image:
    imageDefinition,

  button:
    buttonDefinition,

  // =====================
  // SEMANTIC
  // =====================

  hero:
    heroDefinition,
    cta: ctaDefinition,


    features:
  featuresDefinition,
};
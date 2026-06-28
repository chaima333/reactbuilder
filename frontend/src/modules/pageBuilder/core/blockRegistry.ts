import React from "react";

import StarIcon from "@mui/icons-material/Star";

import CampaignIcon from "@mui/icons-material/Campaign";

import GridViewIcon from "@mui/icons-material/GridView";

import {
  BlockConfig
} from "../types/page.types";

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

import {
  gridDefinition
} from "../components/blocks/layout/grid";

import {
  gridItemDefinition
} from "../components/blocks/layout/gridItem";

import {
  navbarDefinition
} from "../components/blocks/layout/navbar";

import {
  footerDefinition
} from "../components/blocks/layout/footer";

import HelpOutlineIcon from "@mui/icons-material/HelpOutline";

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
import { linkDefinition } from "../components/blocks/primitives/link/definition";
import { inputDefinition } from "../components/blocks/primitives/input/definition";
import { selectDefinition } from "../components/blocks/primitives/select/definition";
import { textareaDefinition } from "../components/blocks/primitives/textarea/definition";

// =========================
// TRANSITIONAL SEMANTIC
// =========================

const emptySemanticDefinition =
  (
    type: any,
    label: string,
    icon: React.ReactNode
  ): BlockConfig => ({

    type,

    label,

    icon,

    category: "semantic",

    isContainer: false,

    fields: [],

    component: () => null,

    defaultData: {

      props: {},

      style: {
        desktop: {},
        tablet: {},
        mobile: {}
      }
    }
  });

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

  grid:
    gridDefinition,

  gridItem:
    gridItemDefinition,

  navbar:
    navbarDefinition,

  footer:
    footerDefinition,

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

    link:
  linkDefinition,

  input:
  inputDefinition,

select:
  selectDefinition,

textarea:
  textareaDefinition,

  // =====================
  // SEMANTIC (TRANSITION)
  // =====================

hero: emptySemanticDefinition(
  "hero",
  "Hero Section",
  React.createElement(
    StarIcon
  )
),

cta: emptySemanticDefinition(
  "cta",
  "CTA Section",
  React.createElement(
  CampaignIcon 
  )
),

features: emptySemanticDefinition(
  "features",
  "Features Section",
  React.createElement(
  GridViewIcon 
  )
),
faq: emptySemanticDefinition(
  "faq",
  "FAQ Section",
  React.createElement(
    HelpOutlineIcon
  )
)
};

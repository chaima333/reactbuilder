import React from "react";

import DashboardCustomizeIcon
from "@mui/icons-material/DashboardCustomize";

import type {
  BlockConfig
} from "../../../../types/page.types";

import {
  GridItemBlock
} from "./GridItemBlock";

export const gridItemDefinition:
BlockConfig = {

  type:
    "gridItem",

  label:
    "Grid Item",

  category:
    "layout",

  icon:
    React.createElement(
      DashboardCustomizeIcon
    ),

  component:
    GridItemBlock,

  isContainer:
    true,

  allowedChildren: [

    "title",
    "text",
    "image",
    "button",
    "link",

    "input",
    "select",
    "textarea",

    "flex",
    "grid"
  ],

  rules: {

    allowedParents: [
      "grid"
    ]
  },

  fields: [],

  defaultData: {

    props: {},

    style: {

      desktop: {

        gridColumn:
          "auto"
      }
    }
  }
};
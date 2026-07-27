import React from "react";
import DashboardCustomizeIcon from "@mui/icons-material/DashboardCustomize";

import {
  GridItemBlock
} from "./GridItemBlock";

import type {
  BlockConfig
} from "../../../../types/page.types";

export const gridItemDefinition: BlockConfig = {
  type: "gridItem",

  label: "Grid Item",

  category: "layout",

  icon:
    React.createElement(
      DashboardCustomizeIcon
    ),

  component:
    GridItemBlock,

  isContainer: true,

  rules: {
    allowedParents: [
      "grid"
    ],

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
      "grid",
      "form",
    ]
  },

  fields: [],

  defaultData: {
    props: {},

    style: {
      desktop: {
        gridColumn: "auto"
      }
    }
  }
};

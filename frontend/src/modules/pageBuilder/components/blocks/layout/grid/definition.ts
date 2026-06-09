// src/modules/pageBuilder/components/blocks/layout/grid/definition.ts

import React from "react";

import GridViewIcon from "@mui/icons-material/GridView";

import { GridBlock } from "./GridBlock";

import type {
  BlockConfig
} from "../../../../types/page.types";

export const gridDefinition: BlockConfig = {

  type:
    "grid",

  label:
    "Grid Layout",

  category:
    "layout",

  icon:
    React.createElement(
      GridViewIcon
    ),

  component:
    GridBlock,

  isContainer:
    true,

  allowedChildren: [
    "gridItem"
  ],

  rules: {

    allowedParents: [
      "section",
      "flexItem"
    ]
  },

  fields: [],

  defaultData: {

    props: {},

    style: {

      desktop: {

        display:
          "grid",

        gridTemplateColumns:
          "repeat(3, minmax(0,1fr))",

        gap:
          "16px"
      },

      tablet: {

        display:
          "grid",

        gridTemplateColumns:
          "repeat(2, minmax(0,1fr))",

        gap:
          "16px"
      },

      mobile: {

        display:
          "grid",

        gridTemplateColumns:
          "repeat(1, minmax(0,1fr))",

        gap:
          "16px"
      }
    }
  }
};
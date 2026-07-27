import React from "react";
import VerticalAlignBottomIcon from "@mui/icons-material/VerticalAlignBottom";

import type {
  BlockConfig
} from "../../../../types/page.types";

import {
  FooterBlock
} from "./FooterBlock";

import {
  footerDefaults
} from "./defaults";

import {
  footerFields
} from "./fields";

export const footerDefinition: BlockConfig = {
  type: "footer",

  label: "Footer",

  category: "layout",

  icon:
    React.createElement(
      VerticalAlignBottomIcon
    ),

  component:
    FooterBlock as any,

  isContainer: true,

  rules: {
    allowedParents: [
      "root",
      "section"
    ],

    allowedChildren: [
      "flex",
      "flexItem",
      "grid",
      "gridItem",

      "title",
      "text",
      "image",
      "button",
      "link"
    ]
  },

  fields:
    footerFields,

  defaultData:
    footerDefaults
};

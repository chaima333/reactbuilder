import React from "react";
import CropLandscapeIcon from "@mui/icons-material/CropLandscape";

import {
  SectionBlock
} from "./SectionBlock";

import {
  sectionDefaults
} from "./defaults";

import {
  sectionFields
} from "./fields";

import type {
  BlockConfig
} from "../../../../types/page.types";

export const sectionDefinition: BlockConfig = {
  type: "section",

  label: "Section",

  icon:
    React.createElement(
      CropLandscapeIcon
    ),

  category: "layout",

  component:
    SectionBlock,

  isContainer: true,

  rules: {
    allowedParents: [
      "root",
      "flexItem"
    ],

    allowedChildren: [
      "title",
      "text",
      "image",
      "button",
      "link",

      "collectionList",
      "form",

      "visitorLogin",
      "visitorRegister",

      "input",
      "select",
      "textarea",

      "flex",
      "grid",

      "hero",
      "features"
    ]
  },

  fields:
    sectionFields,

  defaultData:
    sectionDefaults
};
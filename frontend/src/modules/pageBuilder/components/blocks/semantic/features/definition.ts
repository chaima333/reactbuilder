
import React from "react";

import ViewModuleIcon
from "@mui/icons-material/ViewModule";

import {
  FeaturesBlock
} from "./FeaturesBlock";

import {
  featuresDefaults
} from "./defaults";

import {
  featuresFields
} from "./fields";
import { BlockConfig } from "../../../../types/page.types";

export const featuresDefinition : BlockConfig = {

  category: "semantic",

  type: "features",

  label: "Features Section",

  icon: React.createElement(
    ViewModuleIcon
  ),

  component:
    FeaturesBlock,

  // 👑 IMPORTANT
  isContainer: true,

  allowedChildren: [
    "flex"
  ],

  rules: {

    allowedParents: [
      "section"
    ]
  },

  fields:
    featuresFields,

  defaultData:
    featuresDefaults
};
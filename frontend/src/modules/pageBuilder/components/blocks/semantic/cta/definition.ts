import { BlockConfig } from "../../../../types/page.types";
import React from "react";

import CampaignIcon
from "@mui/icons-material/Campaign";

import {
  CTABlock
} from "./CTABlock";

import {
  ctaDefaults
} from "./defaults";

import {
  ctaFields
} from "./fields";

export const ctaDefinition: BlockConfig = {
  category: "semantic",
  type: "cta",

  label: "CTA Section",

  icon: React.createElement(
    CampaignIcon
  ),

  component: CTABlock,

  isContainer: false,

  rules: {

    allowedParents: [
      "section"
    ]
  },

  fields: ctaFields,

  defaultData: ctaDefaults
};
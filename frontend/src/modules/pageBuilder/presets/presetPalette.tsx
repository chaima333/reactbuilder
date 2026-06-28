import React from "react";

import StarIcon
from "@mui/icons-material/Star";

import CampaignIcon
from "@mui/icons-material/Campaign";

import GridViewIcon
from "@mui/icons-material/GridView";

import HelpOutlineIcon
from "@mui/icons-material/HelpOutline";

export const presetPalette = [

  {
    type: "hero",

    label: "Hero Section",

    icon: (
      <StarIcon
        fontSize="small"
      />
    )
  },

  {
    type: "cta",

    label: "CTA Section",

    icon: (
      <CampaignIcon
        fontSize="small"
      />
    )
  },

  {
    type: "features",

    label: "Features Section",

    icon: (
      <GridViewIcon
        fontSize="small"
      />
    )
  },
  {
  type: "faq",

  label: "FAQ Section",

  icon: (
    <HelpOutlineIcon
      fontSize="small"
    />
  )
},

];
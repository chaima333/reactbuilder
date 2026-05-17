import React from "react";
import StarIcon from "@mui/icons-material/Star";
import { HeroBlock } from "./HeroBlock";
import { heroFields } from "./fields";
import { heroDefaults } from "./defaults";
import { BlockConfig } from "../../../../types/page.types";

export const heroDefinition: BlockConfig = {
  type: "hero", 
  category: "semantic",
  label: "Hero Section",
  icon: React.createElement(StarIcon),
  component: HeroBlock,
  isContainer: false,
  rules: {
    allowedParents: ["section"]
  },
  fields: heroFields,
  defaultData: heroDefaults
};
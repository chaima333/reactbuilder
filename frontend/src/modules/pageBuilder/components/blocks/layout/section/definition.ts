import React from "react";
import CropLandscapeIcon from "@mui/icons-material/CropLandscape";
import { SectionBlock } from "./SectionBlock";
import { sectionDefaults } from "./defaults";
import { sectionFields } from "./fields";
import { BlockConfig } from "../../../../types/page.types";

export const sectionDefinition: BlockConfig = {
  type: "section",
  label: "Section",
  icon: React.createElement(CropLandscapeIcon),
  category: "layout",
  component: SectionBlock,
  isContainer: true,
  allowedChildren: [
    "title",
    "text",
    "image",
    "button",
    "flex",
    "hero",
    "features"
  ],
  rules: {
    allowedParents: [
      "root",
      "flexItem"
    ]
  },
  fields: sectionFields,
  defaultData: sectionDefaults
};

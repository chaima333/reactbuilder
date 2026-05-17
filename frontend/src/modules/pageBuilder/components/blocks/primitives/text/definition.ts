import React from "react";
import TextFieldsIcon from "@mui/icons-material/TextFields";
import { TextBlock } from "./TextBlock";
import { textDefaults } from "./defaults";
import { textFields } from "./fields";
import { BlockConfig } from "../../../../types/page.types";

export const textDefinition: BlockConfig = { 
  type: "text", 
  label: "Text Block",
  category: "content",
  icon: React.createElement(TextFieldsIcon),
  component: TextBlock,
  isContainer: false,
  rules: {
    allowedParents: [
      "section",
      "hero",
      "flexItem"
    ]
  },
  fields: textFields,
  defaultData: textDefaults
};
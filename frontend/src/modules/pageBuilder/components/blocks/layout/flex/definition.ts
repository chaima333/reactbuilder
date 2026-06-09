import React from "react";
import ViewStreamIcon from "@mui/icons-material/ViewStream";
import { FlexBlock } from "./FlexBlock";
import { flexDefaults } from "./defaults";
import { flexFields } from "./fields";
import { BlockConfig } from "../../../../types/page.types";

export const flexDefinition: BlockConfig = {
  type: "flex",
  label: "Flex Layout",
  category: "layout",
  icon: React.createElement(ViewStreamIcon),
  component: FlexBlock as any, 
  isContainer: true,
  rules: {
    allowedParents: ["section", "flexItem", "hero"],
    allowedChildren: [

  "flexItem",

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
  "gridItem"
]
  },
  fields: flexFields,
  defaultData: flexDefaults
};
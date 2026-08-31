import React from "react";
import ViewColumnIcon from "@mui/icons-material/ViewColumn";
import { FlexItemBlock } from "./FlexItemBlock";
import { flexItemDefaults } from "./defaults";
import { flexItemFields } from "./fields";
import { BlockConfig } from "../../../../types/page.types";

export const flexItemDefinition: BlockConfig = {
  type: "flexItem", 
  label: "Column",  
  category: "layout", 
  icon: React.createElement(ViewColumnIcon),
  component: FlexItemBlock as any,
  isContainer: true,
  rules: {
    allowedParents: ["flex"],
    allowedChildren: [
  "title",
  "text",
  "image",
  "button",
  "link",
  "input",
  "select",
  "textarea",
  "section",
  "flex",
  "form",
  "collectionList"
],
  },
  fields: flexItemFields as any, 
  defaultData: flexItemDefaults
};
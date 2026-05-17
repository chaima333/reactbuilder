import React from "react";
import TitleIcon from "@mui/icons-material/Title";
import { TitleBlock } from "./TitleBlock";
import { titleFields } from "./fields";
import { titleDefaults } from "./defaults";
import { BlockConfig } from "../../../../types/page.types";

export const titleDefinition: BlockConfig = {
  type: "title", // توّة TS يعرف إنها BlockType موش string عام
  label: "Title",
  icon: React.createElement(TitleIcon),
  category: "content",
  component: TitleBlock,
  isContainer: false,
  rules: {
    allowedParents: [
      "section",
      "hero",
      "flexItem"
    ]
  },
  fields: titleFields,
  defaultData: titleDefaults
};

import React from "react";
import SmartButtonIcon from "@mui/icons-material/SmartButton";
import { ButtonBlock } from "./ButtonBlock";
import { buttonFields } from "./fields";
import { buttonDefaults } from "./defaults";
import { BlockConfig } from "../../../../types/page.types";

export const buttonDefinition: BlockConfig = { // 👈 هوني المفتاح!
  type: "button",
  label: "Button",
  icon: React.createElement(SmartButtonIcon),
  component: ButtonBlock as any,
  category: "content",
  isContainer: false,
  rules: {
    allowedParents: ["section", "hero", "flexItem"]
  },
  fields: buttonFields,
  defaultData: buttonDefaults
};
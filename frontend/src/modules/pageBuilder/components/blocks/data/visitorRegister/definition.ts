import React from "react";
import PersonAddAltIcon from "@mui/icons-material/PersonAddAlt";

import type {
  BlockConfig
} from "../../../../types/page.types";

import {
  blockExportCapabilities
} from "../../../../export/blockExportCapabilities.generated";

import {
  VisitorRegisterBlock
} from "./VisitorRegisterBlock";

import {
  visitorRegisterDefaults
} from "./defaults";

import {
  visitorRegisterFields
} from "./fields";

export const visitorRegisterDefinition: BlockConfig = {
  type: "visitorRegister",
  label: "Visitor Register",
  icon: React.createElement(PersonAddAltIcon),
  category: "content",
  isContainer: false,
  rules: {
    allowedParents: [
      "section",
      "flexItem",
      "gridItem"
    ],
    singleton: true
  },
  export:
    blockExportCapabilities.visitorRegister,
  fields: visitorRegisterFields,
  component: VisitorRegisterBlock as any,
  defaultData: visitorRegisterDefaults
};

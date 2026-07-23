import React from "react";
import PersonAddAltIcon from "@mui/icons-material/PersonAddAlt";

import type {
  BlockConfig
} from "../../../../types/page.types";

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
  export: {
    mode: "clientRuntime",
    backendRequired: [
      "visitorAuth"
    ],
    fallback: "disabled",
    runtimeModule: "visitorAuth"
  },
  fields: visitorRegisterFields,
  component: VisitorRegisterBlock as any,
  defaultData: visitorRegisterDefaults
};

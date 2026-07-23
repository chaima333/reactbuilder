import React from "react";
import LoginIcon from "@mui/icons-material/Login";

import type {
  BlockConfig
} from "../../../../types/page.types";

import {
  VisitorLoginBlock
} from "./VisitorLoginBlock";

import {
  visitorLoginDefaults
} from "./defaults";

import {
  visitorLoginFields
} from "./fields";

export const visitorLoginDefinition: BlockConfig = {
  type: "visitorLogin",
  label: "Visitor Login",
  icon: React.createElement(LoginIcon),
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
  fields: visitorLoginFields,
  component: VisitorLoginBlock as any,
  defaultData: visitorLoginDefaults
};

import React from "react";
import LoginIcon from "@mui/icons-material/Login";

import type {
  BlockConfig
} from "../../../../types/page.types";

import {
  blockExportCapabilities
} from "../../../../export/blockExportCapabilities.generated";

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
  export:
    blockExportCapabilities.visitorLogin,
  fields: visitorLoginFields,
  component: VisitorLoginBlock as any,
  defaultData: visitorLoginDefaults
};

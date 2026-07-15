import React from "react";

import DynamicFormIcon from
  "@mui/icons-material/DynamicForm";

import {
  BlockConfig
} from "../../../../types/page.types";

import {
  FormBlock
} from "./FormBlock";

import {
  formFields
} from "./fields";

import {
  formDefaults
} from "./defaults";

export const formDefinition: BlockConfig = {
  type: "form",

  label: "Form",

  icon:
    React.createElement(
      DynamicFormIcon
    ),

  category: "content",

  isContainer: false,

  rules: {
    allowedParents: [
      "root",
      "section",
      "flexItem",
      "gridItem"
    ]
  },

  fields:
    formFields,

  component:
    FormBlock as any,

  defaultData:
    formDefaults
};
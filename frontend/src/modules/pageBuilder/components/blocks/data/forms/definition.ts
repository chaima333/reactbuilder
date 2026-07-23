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

  isContainer: true,

  export: {
    mode: "clientRuntime",
    backendRequired: [
      "forms"
    ],
    fallback: "disabled",
    runtimeModule: "forms"
  },

  rules: {
  allowedParents: [
    "root",
    "section",
    "flexItem",
    "gridItem"
  ],

  allowedChildren: [
    "title",
    "text",
    "input",
    "select",
    "textarea",
    "button",
    "link",
    "flex",
    "flexItem",
    "grid",
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

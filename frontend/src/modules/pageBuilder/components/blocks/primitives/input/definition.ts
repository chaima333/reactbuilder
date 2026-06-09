import React from "react";

import InputIcon from "@mui/icons-material/Input";

import {
  InputBlock
} from "./InputBlock";

import {
  inputDefaults
} from "./defaults";
import { BlockConfig } from "../../../../types/page.types";

export const inputDefinition: BlockConfig = {

  type: "input" as const,

  label: "Input",

  category: "primitive",

  icon:
    React.createElement(
      InputIcon
    ),

  component:
    InputBlock,

  isContainer: false,

  fields: [],

  defaultData:{
   ...inputDefaults,
    style: inputDefaults.style as any
  }
};
import React from "react";

import ArrowDropDownCircleIcon
from "@mui/icons-material/ArrowDropDownCircle";

import {
  SelectBlock
} from "./SelectBlock";

import {
  selectDefaults
} from "./defaults";
import { BlockConfig } from "../../../../types/page.types";

export const selectDefinition: BlockConfig = {

  type:
    "select",

  label:
    "Select",

  category:
    "primitive",

  icon:
    React.createElement(
      ArrowDropDownCircleIcon
    ),

  component:
    SelectBlock,

  isContainer:
    false,

  fields: [],

  defaultData:{

   ...selectDefaults,
    style: selectDefaults.style as any
  }
};
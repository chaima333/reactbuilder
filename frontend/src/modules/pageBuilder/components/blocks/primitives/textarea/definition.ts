import React from "react";

import NotesIcon
from "@mui/icons-material/Notes";

import {
  TextareaBlock
} from "./TextareaBlock";

import {
  textareaDefaults
} from "./defaults";
import { BlockConfig } from "../../../../types/page.types";

export const textareaDefinition: BlockConfig = {

  type:
    "textarea",

  label:
    "Textarea",

  category:
    "primitive",

  icon:
    React.createElement(
      NotesIcon
    ),

  component:
    TextareaBlock,

  isContainer:
    false,

  fields: [],

  defaultData:{
   ...textareaDefaults,
    style: textareaDefaults.style as any
  }
};

import { TextControl }
from "./controls/primitive/TextControl";

import { TextareaControl }
from "./controls/primitive/TextareaControl";

import { ColorControl }
from "./controls/primitive/ColorControl";

import { SelectControl }
from "./controls/primitive/SelectControl";

import { ArrayFieldControl }
from "./controls/complex/ArrayFieldControl";

export const controlRegistry: any = {

  text:
    TextControl,

  textarea:
    TextareaControl,

  color:
    ColorControl,

  select:
    SelectControl,

  array:
    ArrayFieldControl
};
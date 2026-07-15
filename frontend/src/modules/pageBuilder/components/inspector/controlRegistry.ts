
import { TextControl }
from "./controls/primitive/TextControl";

import { TextareaControl }
from "./controls/primitive/TextareaControl";

import { ColorControl }
from "./controls/primitive/ColorControl";

import { SelectControl }
from "./controls/primitive/SelectControl";

import { NumberControl }
from "./controls/primitive/NumberControl";

import { ArrayFieldControl }
from "./controls/complex/ArrayFieldControl";

import CmsCollectionSelectControl from "../../../cms/CmsCollectionSelectControl";

import CmsFieldSelectControl from "../../../cms/CmsFieldSelectControl";

import FormSelectControl from "../../../forms/FormSelectControl";
import CmsBindingControl from "../../../cms/CmsBindingControl";

export const controlRegistry: any = {

  text:
    TextControl,

  textarea:
    TextareaControl,

  color:
    ColorControl,

  select:
    SelectControl,

  number:
    NumberControl,

  array:
    ArrayFieldControl,

  cmsCollectionSelect: CmsCollectionSelectControl,

  cmsFieldSelect: CmsFieldSelectControl,

  formSelect:
    FormSelectControl,

  cmsBinding: CmsBindingControl,

};

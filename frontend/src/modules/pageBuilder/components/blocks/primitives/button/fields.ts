import {
  FieldDefinition
} from "../../../../types/page.types";

export const buttonFields:
  FieldDefinition[] = [
  {
    key:
      "label",

    label:
      "Label",

    type:
      "text",

    target:
      "props"
  },

  {
    key:
      "url",

    label:
      "Link",

    type:
      "text",

    target:
      "props"
  },

  {
    key:
      "variant",

    label:
      "Variant",

    type:
      "select",

    target:
      "props",

    options: [
      {
        label:
          "Contained",

        value:
          "contained"
      },

      {
        label:
          "Outlined",

        value:
          "outlined"
      }
    ]
  },

  {
    key:
      "fontSize",

    label:
      "Font Size",

    type:
      "text",

    target:
      "style",

    responsive:
      true,

    validation: {
      cssUnit:
        true
    }
  },

  {
    key:
      "fontWeight",

    label:
      "Font Weight",

    type:
      "select",

    target:
      "style",

    responsive:
      true,

    options: [
      {
        label:
          "Regular",

        value:
          400
      },

      {
        label:
          "Medium",

        value:
          500
      },

      {
        label:
          "Semi Bold",

        value:
          600
      },

      {
        label:
          "Bold",

        value:
          700
      },

      {
        label:
          "Extra Bold",

        value:
          800
      }
    ]
  },

  {
    key:
      "padding",

    label:
      "Padding",

    type:
      "text",

    target:
      "style",

    responsive:
      true
  },

  {
    key:
      "borderRadius",

    label:
      "Border Radius",

    type:
      "text",

    target:
      "style",

    responsive:
      true,

    validation: {
      cssUnit:
        true
    }
  },

  {
    key:
      "backgroundColor",

    label:
      "Background Color",

    type:
      "color",

    target:
      "style",

    responsive:
      true
  },

  {
    key:
      "color",

    label:
      "Text Color",

    type:
      "color",

    target:
      "style",

    responsive:
      true
  },

  {
    key:
      "borderColor",

    label:
      "Border Color",

    type:
      "color",

    target:
      "style",

    responsive:
      true
  }
];
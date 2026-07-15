import { FieldDefinition } from "../../../../types/page.types";

export const collectionListFields: FieldDefinition[] = [
{
  key: "collectionSlug",
  label: "Collection",
  type: "cmsCollectionSelect",
  target: "props",

  resetFields: [
    "titleField",
    "descriptionField",
    "imageField"
  ],

  validation: {
    required: true
  }
},
  {
    key: "titleField",
    label: "Title Field",
    type: "cmsFieldSelect",
    target: "props"
  },
  {
    key: "descriptionField",
    label: "Description Field",
    type: "cmsFieldSelect",
    target: "props"
  },
  {
    key: "imageField",
    label: "Image Field",
    type: "cmsFieldSelect",
    target: "props"
  },
  {
    key: "limit",
    label: "Limit",
    type: "number",
    target: "props",
    validation: {
      min: 1,
      max: 50
    }
  },
  {
    key: "gridTemplateColumns",
    label: "Columns",
    type: "select",
    target: "style",
    category: "layout",
    responsive: true,
    options: [
      {
        label: "Auto",
        value: "repeat(auto-fit, minmax(240px, 1fr))"
      },
      {
        label: "2 columns",
        value: "repeat(2, minmax(0, 1fr))"
      },
      {
        label: "3 columns",
        value: "repeat(3, minmax(0, 1fr))"
      },
      {
        label: "1 column",
        value: "1fr"
      }
    ]
  },
  {
    key: "gap",
    label: "Gap",
    type: "text",
    target: "style",
    category: "spacing",
    responsive: true,
    validation: {
      cssUnit: true
    }
  },
  {
    key: "padding",
    label: "Padding",
    type: "text",
    target: "style",
    category: "spacing",
    responsive: true
  },
  {
    key: "backgroundColor",
    label: "Background",
    type: "color",
    target: "style",
    category: "visual",
    responsive: true
  }
];

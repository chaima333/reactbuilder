import { FieldDefinition } from "../../../../types/page.types";

export const imageFields: FieldDefinition[] = [
  {
  key: "url",
  label: "Image URL",
  type: "cmsBinding",
  target: "props",
  validation: {
    required: true
  }
},
  {
    key: "alt",
    label: "Alt Text",
    type: "text",
    target: "props"
  },
  {
    key: "width",
    label: "Width",
    type: "text",
    target: "style",
    responsive: true,
    validation: { cssUnit: true }
  },
  {
    key: "textAlign",
    label: "Alignment",
    type: "select",
    target: "style",
    responsive: true,
    options: [
      { label: "Start", value: "flex-start" },
      { label: "Center", value: "center" },
      { label: "End", value: "flex-end" }
    ]
  },
  {
    key: "borderRadius",
    label: "Border Radius",
    type: "text",
    target: "style",
    responsive: true
  },
  {
    key: "objectFit",
    label: "Object Fit",
    type: "select",
    target: "style",
    responsive: true,
    options: [
      { label: "Cover", value: "cover" },
      { label: "Contain", value: "contain" },
      { label: "Fill", value: "fill" }
    ]
  }
];

import { FieldDefinition } from "../../../../types/page.types";

export const linkFields: FieldDefinition[] = [
  {
    key: "label",
    label: "Link Text",
    type: "text",
    target: "props",
    validation: {
      required: true
    }
  },
  {
    key: "href",
    label: "URL",
    type: "text",
    target: "props",
    validation: {
      required: true
    }
  },
  {
    key: "fontSize",
    label: "Font Size",
    type: "text",
    target: "style",
    responsive: true,
    validation: {
      cssUnit: true
    }
  },
  {
    key: "color",
    label: "Color",
    type: "color",
    target: "style",
    responsive: true
  }
];
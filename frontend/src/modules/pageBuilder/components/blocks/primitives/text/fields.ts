import { FieldDefinition } from "../../../../types/page.types";

export const textFields: FieldDefinition[] = [ // 👈 زيد التايب هوني
  {
    key: "content",
    label: "Text Content",
    type: "textarea", 
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
    key: "lineHeight",
    label: "Line Height",
    type: "text",
    target: "style",
    responsive: true
  },
  {
    key: "color",
    label: "Color",
    type: "color",
    target: "style",
    responsive: true
  }
];
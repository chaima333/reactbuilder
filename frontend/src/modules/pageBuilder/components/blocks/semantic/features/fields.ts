import { FieldDefinition } from "../../../../types/page.types";

export const featuresFields: FieldDefinition[] = [
  {
    key: "headline",
    label: "Headline",
    type: "text",
    target: "props"
  },
  {
    key: "subtext",
    label: "Subtext",
    type: "textarea",
    target: "props"
  },
  {
    key: "items",
    label: "Feature Items",
    type: "array",
    target: "props",
    itemSchema: [
      { 
        key: "title", 
        label: "Title", 
        type: "text", 
        target: "props" // 👈 لازم تزيد هذي
      },
      { 
        key: "description", 
        label: "Description", 
        type: "textarea", 
        target: "props" // 👈 ولازم تزيد هذي
      }
    ]
  },
  {
    key: "backgroundColor",
    label: "Background",
    type: "color",
    target: "style",
    responsive: true,
    category: "visual" // 👈 أحسن تزيد الـ category للـ style fields
  }
];
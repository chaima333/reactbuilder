import { FieldDefinition } from "../../../../types/page.types";

export const buttonFields: FieldDefinition[] = [
  { 
    key: "label", 
    label: "Label", 
    type: "text", // توّة الـ TS يعرف إنو "text" مسموح بيها
    target: "props" 
  },
  { 
    key: "url", 
    label: "Link", 
    type: "text", 
    target: "props" 
  },
  {
    key: "variant",
    label: "Variant",
    type: "select",
    target: "props",
    options: [
      { label: "Contained", value: "contained" },
      { label: "Outlined", value: "outlined" }
    ]
  }
];
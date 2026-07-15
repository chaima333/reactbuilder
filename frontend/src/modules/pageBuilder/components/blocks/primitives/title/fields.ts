import { FieldDefinition } from "../../../../types/page.types";

export const titleFields: FieldDefinition[] = [
 {
  key: "content",
  label: "Title Text",
  type: "cmsBinding",
  target: "props"
},
  {
    key: "fontSize",
    label: "Font Size",
    type: "select",
    target: "style",
    category: "typography"
  },
  {
    key: "textAlign",
    label: "Alignment",
    type: "select", 
    target: "style",
    category: "layout",
    options: [
      { label: "Left", value: "left" },
      { label: "Center", value: "center" },
      { label: "Right", value: "right" }
    ]
  },
  {
    key: "marginTop",
    label: "Margin Top",
    type: "text", // أو "number" حسب الـ input اللي عندك
    target: "style",
    category: "spacing"
  },
  {
    key: "marginBottom",
    label: "Margin Bottom",
    type: "text",
    target: "style",
    category: "spacing"
  },
  {
    key: "color",
    label: "Text Color",
    type: "color",
    target: "style",
    category: "visual"
  }
];
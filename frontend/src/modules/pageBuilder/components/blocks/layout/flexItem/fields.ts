import { FieldDefinition } from "../../../../types/page.types";

export const flexItemFields: FieldDefinition[] = [
  {
    key: "flex",
    label: "Flex Ratio",
    type: "select",
    target: "style",
    responsive: true,
    options: [
      { label: "1x", value: "1" },
      { label: "2x", value: "2" },
      { label: "3x", value: "3" },
      { label: "4x", value: "4" }
    ]
  },
  {
    key: "padding",
    label: "Padding",
    type: "text",
    target: "style",
    responsive: true
  },
  {
    key: "backgroundColor",
    label: "Background",
    type: "color",
    target: "style",
    responsive: true
  }
];
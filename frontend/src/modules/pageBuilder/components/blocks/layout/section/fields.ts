import { FieldDefinition } from "../../../../types/page.types";

export const sectionFields: FieldDefinition[] = [
  {
    key: "paddingTop",
    label: "Padding Top",
    type: "text",
    target: "style",
    responsive: true
  },
  {
    key: "paddingBottom",
    label: "Padding Bottom",
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
  },
  {
    key: "maxWidth",
    label: "Max Width",
    type: "text",
    target: "style",
    responsive: true
  }
];
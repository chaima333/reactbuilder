import { FieldDefinition } from "../../../../types/page.types";

export const flexItemFields: FieldDefinition[] = [
  {
    key: "flexGrow",
    label: "Grow",
    type: "select",
    target: "style",
    responsive: true,
    options: [
      { label: "0", value: "0" },
      { label: "1", value: "1" },
      { label: "2", value: "2" },
      { label: "3", value: "3" },
      { label: "4", value: "4" }
    ]
  },
  {
    key: "flexShrink",
    label: "Shrink",
    type: "select",
    target: "style",
    responsive: true,
    options: [
      { label: "0", value: "0" },
      { label: "1", value: "1" }
    ]
  },
  {
    key: "flexBasis",
    label: "Basis",
    type: "text",
    target: "style",
    responsive: true
  }
];

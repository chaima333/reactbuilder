import { FieldDefinition } from "../../../../types/page.types";

export const heroFields: FieldDefinition[] = [
  {
    key: "headline",
    label: "Headline",
    type: "text",
    target: "props",
    validation: { required: true }
  },
  {
    key: "subtext",
    label: "Subtext",
    type: "textarea",
    target: "props"
  },
  {
    key: "primaryAction.label",
    label: "Button Label",
    type: "text",
    target: "props"
  },
  {
    key: "backgroundColor",
    label: "Background",
    type: "color",
    target: "style",
    responsive: true
  },
  {
    key: "minHeight",
    label: "Min Height",
    type: "text",
    target: "style",
    responsive: true
  },
  {
    key: "headlineSize",
    label: "Headline Size",
    type: "text",
    target: "style",
    responsive: true
  }
];
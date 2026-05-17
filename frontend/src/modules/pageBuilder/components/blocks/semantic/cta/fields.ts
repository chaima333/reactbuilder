import { FieldDefinition } from "../../../../types/page.types";

export const ctaFields: FieldDefinition[] = [

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
    key: "backgroundColor",

    label: "Background",

    type: "color",

    target: "style",

    responsive: true
  },

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
  }
] as const;
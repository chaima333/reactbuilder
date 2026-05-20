// src/modules/pageBuilder/components/blocks/layout/gridItem/fields.ts

export const gridItemFields = [
  {
    name: "style.desktop.gridColumn",
    label: "Grid Column Span",
    type: "text", // استعمال الـ primitive text field العادي لتفادي الـ undefined
    defaultValue: "auto",
  },
  {
    name: "style.desktop.gridRow",
    label: "Grid Row Span",
    type: "text",
    defaultValue: "auto",
  }
];
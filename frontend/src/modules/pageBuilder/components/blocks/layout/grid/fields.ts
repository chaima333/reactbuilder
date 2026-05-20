// src/modules/pageBuilder/components/blocks/layout/grid/fields.ts

export const gridItemFields = [
  {
    name: "style.desktop.columns",
    label: "Grid Columns",
    type: "number", // حقل أرقام عادي آمن 100%
    defaultValue: 3,
  },
  {
    name: "style.desktop.gap",
    label: "Gap Spacing",
    type: "text",
    defaultValue: "16px",
  }
];
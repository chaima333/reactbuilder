// src/modules/pageBuilder/components/blocks/layout/grid/fields.ts

export const gridItemFields = [

  {

    name:
      "style.desktop.gridTemplateColumns",

    label:
      "Desktop Grid Columns",

    type:
      "text",

    defaultValue:
      "repeat(3, minmax(0,1fr))"
  },

  {

    name:
      "style.tablet.gridTemplateColumns",

    label:
      "Tablet Grid Columns",

    type:
      "text",

    defaultValue:
      "repeat(2, minmax(0,1fr))"
  },

  {

    name:
      "style.mobile.gridTemplateColumns",

    label:
      "Mobile Grid Columns",

    type:
      "text",

    defaultValue:
      "repeat(1, minmax(0,1fr))"
  },

  {

    name:
      "style.desktop.gap",

    label:
      "Gap Spacing",

    type:
      "text",

    defaultValue:
      "16px"
  }
];
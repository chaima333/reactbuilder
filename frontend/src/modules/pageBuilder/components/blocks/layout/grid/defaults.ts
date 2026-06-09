// src/modules/pageBuilder/components/blocks/layout/grid/defaults.ts

import type {
  BlockConfig
} from "../../../../types/page.types";

export const gridDefaults = {

  props: {},

  style: {

    desktop: {

      display:
        "grid",

      gridTemplateColumns:
        "repeat(3, minmax(0,1fr))",

      gap:
        "16px"
    },

    tablet: {

      display:
        "grid",

      gridTemplateColumns:
        "repeat(2, minmax(0,1fr))",

      gap:
        "16px"
    },

    mobile: {

      display:
        "grid",

      gridTemplateColumns:
        "repeat(1, minmax(0,1fr))",

      gap:
        "16px"
    }
  }

} satisfies BlockConfig["defaultData"];
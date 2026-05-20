import type {
  BlockConfig
} from "../../../../types/page.types";

export const gridDefaults = {

  props: {},

  style: {

    desktop: {

      columns: 4,

      gap: "24px"
    },

    tablet: {

      columns: 2,

      gap: "16px"
    },

    mobile: {

      columns: 1,

      gap: "12px"
    }
  }

} satisfies BlockConfig["defaultData"];
import type {
  BlockConfig
} from "../../../../types/page.types";

export const sectionDefaults = {
  props: {},

  style: {
    desktop: {
      paddingTop:
        "88px",

      paddingBottom:
        "88px",

      paddingLeft:
        "24px",

      paddingRight:
        "24px",

      backgroundColor: "rgba(0,0,0,0)",

      width:
        "100%",

      maxWidth:
        "1200px"
    },

    tablet: {
      paddingTop:
        "72px",

      paddingBottom:
        "72px",

      paddingLeft:
        "24px",

      paddingRight:
        "24px"
    },

    mobile: {
      paddingTop:
        "56px",

      paddingBottom:
        "56px",

      paddingLeft:
        "18px",

      paddingRight:
        "18px"
    }
  }
} satisfies BlockConfig["defaultData"];
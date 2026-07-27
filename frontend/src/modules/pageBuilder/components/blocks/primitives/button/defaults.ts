import {
  BlockConfig
} from "../../../../types/page.types";

export const buttonDefaults = {
  props: {
    label: "Click Me",
    url: "#",
    variant: "contained",
    useTheme: true,
    buttonType: "button"
  },

  style: {
    desktop: {
      display: "inline-flex",

      paddingTop: "12px",
      paddingBottom: "12px",
      paddingLeft: "24px",
      paddingRight: "24px",

      borderRadius: "9999px",
      fontSize: "15px",
      fontWeight: 700
    },

    tablet: {},

    mobile: {
      paddingTop: "11px",
      paddingBottom: "11px",
      paddingLeft: "20px",
      paddingRight: "20px"
    }
  }
} satisfies BlockConfig["defaultData"];
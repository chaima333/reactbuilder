import { BlockConfig } from "../../../../types/page.types";

export const navbarDefaults = {
  props: {},
  style: {
    desktop: {
      flexDirection: "row",
      gap: "24px",
      justifyContent: "space-between",
      alignItems: "center",
      flexWrap: "nowrap",
      width: "100%",
      paddingTop: "16px",
      paddingBottom: "16px",
      paddingLeft: "24px",
      paddingRight: "24px"
    },
    tablet: {},
    mobile: {
      flexDirection: "column",
      gap: "12px"
    }
  }
} satisfies BlockConfig["defaultData"];

import type { BlockConfig } from "../../../../types/page.types";

export const sectionDefaults = {

  props: {},

  style: {

    desktop: {

      paddingTop: "80px",

      paddingBottom: "80px",

      paddingLeft: "20px",

      paddingRight: "20px",

      backgroundColor: "#ffffff",

      maxWidth: "1200px",

      marginLeft: "auto",

      marginRight: "auto"
    }
  }
} satisfies BlockConfig["defaultData"];

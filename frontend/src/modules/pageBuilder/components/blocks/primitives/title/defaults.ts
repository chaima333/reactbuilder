import { BlockConfig } from "../../../../types/page.types";

export const titleDefaults = {
  props: {
    content: "Title Text Content",
  },
  style: {
    desktop: {
      fontSize: "displayXL",
      fontWeight: "bold",
      color: "primary",
      textAlign: "center"
    }
  }
} satisfies BlockConfig["defaultData"]; 
import { BlockConfig } from "../../../../types/page.types";

export const titleDefaults = {
  props: {
    content: "Title Text Content"
  },
  style: {
    desktop: {
      fontSize: "headingXL",
      fontWeight: 700,
      color: "text",
      textAlign: "left"
    },
    tablet: {},
    mobile: {}
  }
} satisfies BlockConfig["defaultData"];
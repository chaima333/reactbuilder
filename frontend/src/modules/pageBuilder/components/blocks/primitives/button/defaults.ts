import { BlockConfig } from "../../../../types/page.types";

export const buttonDefaults = {
  props: {
    label: "Click Me",
    url: "#",
    variant: "contained" 
  },
  style: {
    desktop: {
      backgroundColor: "primary", 
      color: "#ffffff" 
    }
  }
} satisfies BlockConfig["defaultData"];
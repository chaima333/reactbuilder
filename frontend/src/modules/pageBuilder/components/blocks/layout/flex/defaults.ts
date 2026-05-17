import { BlockConfig } from "../../../../types/page.types";

export const flexDefaults = {
  props: {},
  style: {
    desktop: {
      flexDirection: "row",         
      gap: "20px",                
      justifyContent: "flex-start",
      alignItems: "stretch",       
      flexWrap: "nowrap",
      padding: "0px",
      minHeight: "120px"
    }
  }
} satisfies BlockConfig["defaultData"]; 
import { BlockConfig } from "../../../../types/page.types";

export const flexDefaults = {
  props: {},
  style: {
  desktop: {

  flexDirection: "row",

  gap: "0px",

  justifyContent: "flex-start",

  alignItems: "stretch",

  flexWrap: "nowrap",

  width: "100%",

  padding: "0px",

  minHeight: "auto"
}
  }
} satisfies BlockConfig["defaultData"]; 

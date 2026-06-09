// src/modules/pageBuilder/components/blocks/layout/flexItem/defaults.ts
import { BlockConfig } from "../../../../types/page.types";

export const flexItemDefaults = {
  props: {},
  style: {
    desktop: {
      flexGrow: "1",
      flexShrink: "1",
      flexBasis: "auto"
    }
  }
} satisfies BlockConfig["defaultData"]; 

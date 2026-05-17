// src/modules/pageBuilder/components/blocks/layout/flexItem/defaults.ts
import { BlockConfig } from "../../../../types/page.types";

export const flexItemDefaults = {
  props: {},
  style: {
    desktop: {
      flex: "1",           
      padding: "20px",     
      minHeight: "100px"   
    }
  }
} satisfies BlockConfig["defaultData"]; 
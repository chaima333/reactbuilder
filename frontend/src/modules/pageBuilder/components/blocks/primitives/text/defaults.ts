// src/modules/pageBuilder/components/blocks/primitive/text/defaults.ts
import { BlockConfig } from "../../../../types/page.types";

export const textDefaults = {
  props: {
    content: "Paragraph text content..."
  },
  style: {
    desktop: {
      fontSize: "bodyMD",
      color: "text",
      lineHeight: "1.6"
    }
  }
} satisfies BlockConfig["defaultData"]; 
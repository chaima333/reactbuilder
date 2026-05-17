// src/modules/pageBuilder/components/blocks/semantic/cta/defaults.ts
import { BlockConfig } from "../../../../types/page.types";

export const ctaDefaults = {
  props: {
    headline: "Ready to start?",
    subtext: "Join over 10,000 teams using our platform.",
    actions: [
      { label: "Get Started", url: "/signup" }
    ]
  },
  style: {
    desktop: {
      backgroundColor: "primary",
      textAlign: "center",
      paddingTop: "80px",
      paddingBottom: "80px",
      minHeight: "300px" // ✅ لازم تكون px/rem/%/auto
    }
  }
} satisfies BlockConfig["defaultData"]; // 🛡️ السر الكل هوني
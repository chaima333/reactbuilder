import { BlockConfig } from "../../../../types/page.types";

export const featuresDefaults = {
  props: {
    headline: "Our Amazing Features",
    subtext: "Discover why thousands of users choose our platform every day.",
    items: [
      { title: "Fast Performance", description: "Lightning fast load times." },
      { title: "Secure Data", description: "Top-tier encryption for your safety." }
    ],
  },
  style: {
    desktop: {
      backgroundColor: "surface", 
      textAlign: "center",
      paddingTop: "60px",    
      paddingBottom: "60px" 
    }
  }
} satisfies BlockConfig["defaultData"]; //
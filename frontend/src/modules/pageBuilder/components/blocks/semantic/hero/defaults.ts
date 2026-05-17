import { BlockConfig } from "../../../../types/page.types";

export const heroDefaults = {
  props: {
    headline: "The Next Generation Builder",
    subtext: "Build semantic websites with a clean canonical runtime.",
    primaryAction: {
      label: "Explore Now",
      url: "#",
      variant: "contained" // ✅ ضفناها هوني زاد لضمان سلامة الـ Contract للـ Child Button داخل الـ Hero
    }
  },
  style: {
    desktop: {
      backgroundColor: "#f5f5f5",
      textAlign: "center",
      paddingTop: "120px",
      paddingBottom: "120px",
      fontSize: "64px", 
      minHeight: "600px" 
    }
  }
} satisfies BlockConfig["defaultData"];
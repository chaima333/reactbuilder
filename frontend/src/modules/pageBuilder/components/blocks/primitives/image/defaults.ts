import { BlockConfig } from "../../../../types/page.types";

export const imageDefaults = {
  props: {
    url: "https://placehold.co/600x400", // 👑 تم التوحيد الرسمي والنهائي على url
    alt: "Image"
  },
  style: {
    desktop: {
      width: "100%",        
      borderRadius: "0px", 
      // objectFit: "cover" 
    }
  }
} satisfies BlockConfig["defaultData"];
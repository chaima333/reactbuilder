import { BlockConfig } from "../../../../types/page.types";

export const footerDefaults = {
  props: {},
  style: {
    desktop: {
      display: "flex",
      flexDirection: "column",
      gap: "32px",
      width: "100%",
      paddingTop: "70px",
      paddingBottom: "35px",
      paddingLeft: "40px",
      paddingRight: "40px",
      backgroundColor: "#020617",
      color: "#ffffff"
    },
    tablet: {
      paddingTop: "56px",
      paddingBottom: "32px",
      paddingLeft: "28px",
      paddingRight: "28px"
    },
    mobile: {
      paddingTop: "44px",
      paddingBottom: "28px",
      paddingLeft: "20px",
      paddingRight: "20px",
      gap: "24px"
    }
  }
} satisfies BlockConfig["defaultData"];

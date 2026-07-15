import {
  BlockConfig
} from "../../../../types/page.types";

export const formDefaults = {
  props: {
    formId: "",
    title: "Contact us",
    submitText: "Send",
    successMessage:
      "Your message has been sent successfully.",
    errorMessage:
      "Failed to send your message."
  },

  style: {
    desktop: {
      width: "100%",
      maxWidth: "720px",
      marginLeft: "auto",
      marginRight: "auto",
      paddingTop: "32px",
      paddingBottom: "32px",
      paddingLeft: "24px",
      paddingRight: "24px"
    },

    tablet: {
      paddingLeft: "20px",
      paddingRight: "20px"
    },

    mobile: {
      paddingTop: "24px",
      paddingBottom: "24px",
      paddingLeft: "16px",
      paddingRight: "16px"
    }
  }
} satisfies BlockConfig["defaultData"];
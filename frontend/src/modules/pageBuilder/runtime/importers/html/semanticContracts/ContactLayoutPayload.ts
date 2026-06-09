export type ContactLayoutPayload = {

  type:
    "CONTACT_LAYOUT";

  // =====================================
  // CONTACT SECTIONS
  // =====================================

  sections?: {

    title:
      string;

    items:
      string[];

    style?: any;

  }[];

  // =====================================
  // FORM ROWS
  // =====================================

  formRows?: {

    style?: any;

    fields: {

      tag:
        string;

      placeholder:
        string;

      type:
        string;

      label?: string;

      options?: string[];

      style?: any;

    }[];

  }[];

  // =====================================
  // FORM CONTENT
  // =====================================

  formTitle?:
    string;

  formDescription?:
    string;

  submitLabel?:
    string;

  // =====================================
  // GLOBAL STYLES
  // =====================================

  formStyle?:
    any;

  heroStyle?:
    any;

  // =====================================
  // CLAIMED NODE
  // =====================================

  claimedNode?:
    any;
};
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

  contactRows?: {
    label: string;
    value: string;
    href?: string;
    style?: any;
    labelStyle?: any;
    valueStyle?: any;
  }[];

  gridStyle?: any;

  contactTableStyle?: any;

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

      name?: string;

      options?: string[];

      style?: any;

      labelStyle?: any;

    }[];

  }[];

  // =====================================
  // FORM CONTENT
  // =====================================

  formTitle?:
    string;

  formDescription?:
    string;

  formTitleStyle?: any;

  formDescriptionStyle?: any;

  submitLabel?:
    string;

  submitStyle?: any;

  // =====================================
  // GLOBAL STYLES
  // =====================================

  formStyle?:
    any;

  heroStyle?:
    any;

  sectionStyle?: any;
inheritedPageStyle?: any;

  // =====================================
  // CLAIMED NODE
  // =====================================

  claimedNode?:
    any;
};

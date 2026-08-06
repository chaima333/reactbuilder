import {
  FieldDefinition
} from "../../../../types/page.types";

export const linkFields:
  FieldDefinition[] = [
  {
    key:
      "label",

    label:
      "Texte du lien",

    type:
      "text",

    target:
      "props",

    validation: {
      required:
        true
    }
  },

  {
    key:
      "actionType",

    label:
      "Action",

    type:
      "select",

    target:
      "props",

    options: [
      {
        label:
          "Lien personnalisé",

        value:
          "custom"
      },

      {
        label:
          "Devenir partenaire",

        value:
          "partnerApplication"
      }
    ]
  },

  {
    key:
      "href",

    label:
      "Lien personnalisé",

    type:
      "text",

    target:
      "props"
  },

  {
    key:
      "fontSize",

    label:
      "Font Size",

    type:
      "text",

    target:
      "style",

    responsive:
      true,

    validation: {
      cssUnit:
        true
    }
  },

  {
    key:
      "color",

    label:
      "Color",

    type:
      "color",

    target:
      "style",

    responsive:
      true
  }
];
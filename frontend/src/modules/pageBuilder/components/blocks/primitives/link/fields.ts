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
      "Taille du texte",

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
      "fontWeight",

    label:
      "Épaisseur",

    type:
      "select",

    target:
      "style",

    responsive:
      true,

    options: [
      {
        label:
          "Normal",

        value:
          "400"
      },

      {
        label:
          "Medium",

        value:
          "500"
      },

      {
        label:
          "Semi-bold",

        value:
          "600"
      },

      {
        label:
          "Bold",

        value:
          "700"
      }
    ]
  },

  {
    key:
      "fontStyle",

    label:
      "Style du texte",

    type:
      "select",

    target:
      "style",

    responsive:
      true,

    options: [
      {
        label:
          "Normal",

        value:
          "normal"
      },

      {
        label:
          "Italique",

        value:
          "italic"
      }
    ]
  },

  {
    key:
      "textDecoration",

    label:
      "Soulignement",

    type:
      "select",

    target:
      "style",

    responsive:
      true,

    options: [
      {
        label:
          "Aucun",

        value:
          "none"
      },

      {
        label:
          "Souligné",

        value:
          "underline"
      },

      {
        label:
          "Barré",

        value:
          "line-through"
      }
    ]
  },

  {
    key:
      "color",

    label:
      "Couleur",

    type:
      "color",

    target:
      "style",

    responsive:
      true
  },

  {
    key:
      "lineHeight",

    label:
      "Hauteur de ligne",

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
      "textAlign",

    label:
      "Alignement",

    type:
      "select",

    target:
      "style",

    responsive:
      true,

    options: [
      {
        label:
          "Gauche",

        value:
          "left"
      },

      {
        label:
          "Centre",

        value:
          "center"
      },

      {
        label:
          "Droite",

        value:
          "right"
      }
    ]
  }
];
import {
  FieldDefinition
} from "../../../../types/field.types";

export const formFields: FieldDefinition[] = [
{
  key: "formId",
  label: "Form",
  type: "formSelect",
  target: "props",
  validation: {
    required: true
  }
},

  {
    key: "title",
    label: "Title",
    type: "text",
    target: "props"
  },

  {
    key: "submitText",
    label: "Submit Button Text",
    type: "text",
    target: "props",
    validation: {
      required: true
    }
  },

  {
    key: "successMessage",
    label: "Success Message",
    type: "text",
    target: "props"
  },

  {
    key: "errorMessage",
    label: "Error Message",
    type: "text",
    target: "props"
  },

  {
    key: "paddingTop",
    label: "Padding Top",
    type: "text",
    target: "style",
    category: "layout",
    responsive: true,
    validation: {
      cssUnit: true
    }
  },

  {
    key: "paddingBottom",
    label: "Padding Bottom",
    type: "text",
    target: "style",
    category: "layout",
    responsive: true,
    validation: {
      cssUnit: true
    }
  }
];
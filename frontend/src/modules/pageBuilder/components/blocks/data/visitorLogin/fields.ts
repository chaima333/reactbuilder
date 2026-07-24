import type {
  FieldDefinition
} from "../../../../types/page.types";

export const visitorLoginFields: FieldDefinition[] = [
  { key: "title", label: "Title", type: "text", target: "props" },
  { key: "subtitle", label: "Subtitle", type: "text", target: "props" },
  { key: "emailLabel", label: "Email Label", type: "text", target: "props" },
  { key: "emailPlaceholder", label: "Email Placeholder", type: "text", target: "props" },
  { key: "passwordLabel", label: "Password Label", type: "text", target: "props" },
  { key: "passwordPlaceholder", label: "Password Placeholder", type: "text", target: "props" },
  { key: "submitText", label: "Submit Text", type: "text", target: "props" },
  { key: "dividerText", label: "Divider Text", type: "text", target: "props" },
  { key: "registerPromptText", label: "Register Prompt", type: "text", target: "props" },
  { key: "registerLinkText", label: "Register Link Text", type: "text", target: "props" },
  { key: "invalidCredentialsMessage", label: "Invalid Credentials Message", type: "text", target: "props" },
  {
    key: "layoutVariant",
    label: "Layout",
    type: "select",
    target: "props",
    options: [
      { label: "Card", value: "card" },
      { label: "Minimal", value: "minimal" },
      { label: "Split", value: "split" }
    ]
  },
  { key: "maxWidth", label: "Max Width", type: "text", target: "style", responsive: true },
  { key: "width", label: "Width", type: "text", target: "style", responsive: true },
  { key: "backgroundColor", label: "Background", type: "color", target: "style", responsive: true },
  { key: "color", label: "Text Color", type: "color", target: "style", responsive: true },
  { key: "border", label: "Border", type: "text", target: "style", responsive: true },
  { key: "borderRadius", label: "Border Radius", type: "text", target: "style", responsive: true },
  { key: "padding", label: "Spacing", type: "text", target: "style", responsive: true },
  { key: "fontFamily", label: "Font Family", type: "text", target: "style", responsive: true },
  { key: "fontSize", label: "Font Size", type: "text", target: "style", responsive: true }
];

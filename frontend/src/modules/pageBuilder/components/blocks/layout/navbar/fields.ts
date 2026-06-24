import { BlockField } from "../../../../types/page.types";
import { flexFields } from "../flex/fields";

export const navbarFields: BlockField[] = [
  ...flexFields,

  {
    key: "backgroundColor",
    label: "Background Color",
    type: "color",
    target: "style",
    responsive: true
  },
  {
    key: "color",
    label: "Text Color",
    type: "color",
    target: "style",
    responsive: true
  },
  {
    key: "borderBottom",
    label: "Border Bottom",
    type: "text",
    target: "style",
    responsive: true
  },
  {
    key: "boxShadow",
    label: "Shadow",
    type: "text",
    target: "style",
    responsive: true
  }
];
import { BlockField } from "../../../../types/page.types";
import { flexFields } from "../flex/fields";

export const footerFields: BlockField[] = [
  ...flexFields,
  {
    key: "borderTop",
    label: "Border Top",
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

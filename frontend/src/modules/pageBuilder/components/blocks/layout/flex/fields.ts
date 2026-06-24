import { BlockField } from "../../../../types/page.types";

export const flexFields: BlockField[] = [
  {
    key: "flexDirection",
    label: "Direction",
    type: "select",
    target: "style",
    responsive: true,
    options: [
      { label: "Row", value: "row" },
      { label: "Column", value: "column" }
    ]
  },
  {
    key: "gap",
    label: "Gap",
    type: "text",
    target: "style",
    responsive: true
  },
  {
    key: "flexWrap",
    label: "Wrap",
    type: "select",
    target: "style",
    responsive: true,
    options: [
      { label: "No Wrap", value: "nowrap" },
      { label: "Wrap", value: "wrap" }
    ]
  },
  {
    key: "justifyContent",
    label: "Justify",
    type: "select",
    target: "style",
    responsive: true,
    options: [
      { label: "Start", value: "flex-start" },
      { label: "Center", value: "center" },
      { label: "Space Between", value: "space-between" }
    ]
  },
  {
    key: "alignItems",
    label: "Align Items",
    type: "select",
    target: "style",
    responsive: true,
    options: [
      { label: "Stretch", value: "stretch" },
      { label: "Center", value: "center" },
      { label: "Start", value: "flex-start" }
    ]
  },
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
  key: "paddingTop",
  label: "Padding Top",
  type: "text",
  target: "style",
  responsive: true
},
{
  key: "paddingBottom",
  label: "Padding Bottom",
  type: "text",
  target: "style",
  responsive: true
}
];

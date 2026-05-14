
import React from "react";
import { BlockConfig } from "../types/page.types";
import { SectionBlock } from "../components/blocks/SectionBlock";
import { TextBlock } from "../components/blocks/TextBlock";
import { TitleBlock } from "../components/blocks/TitleBlock";
import { ImageBlock } from "../components/blocks/ImageBlock";
import { ButtonBlock } from "../components/blocks/ButtonBlock";
import { HeroBlock } from "../components/blocks/HeroBlock";
import { FlexBlock }  from "../components/blocks/FlexBlock"
import ViewQuiltIcon from "@mui/icons-material/ViewQuilt";
import TextFieldsIcon from "@mui/icons-material/TextFields";
import TitleIcon from "@mui/icons-material/Title";
import ImageIcon from "@mui/icons-material/Image";
import SmartButtonIcon from "@mui/icons-material/SmartButton";
import StarIcon from "@mui/icons-material/Star";
import ViewColumnIcon from '@mui/icons-material/ViewColumn';
import { FlexItemBlock } from "../components/blocks/FlexItemBlock";

export const blockRegistry: Record<string, BlockConfig> = {  // SECTION
  // ========================
  section: {
    component: SectionBlock,
    label: "Section",
    icon: React.createElement(ViewQuiltIcon),
    isContainer: true,
    allowedChildren: ["text", "image", "button", "title", "hero", "flex"],
    rules: {
      allowedParents: ["root"], // السيكشن هي اللي تبدأ بيها الصفحة عادة
    },
    fields: [
      { key: "backgroundColor", label: "Background", type: "color", target: "style", responsive: true },
      { key: "paddingTop", label: "Padding Top", type: "text", target: "style", responsive: true, validation: { cssUnit: true } },
      { key: "paddingBottom", label: "Padding Bottom", type: "text", target: "style", responsive: true, validation: { cssUnit: true } },
      { key: "gap", label: "Gap", type: "text", target: "style", responsive: true, validation: { cssUnit: true } },
      { 
        key: "flexDirection", 
        label: "Direction", 
        type: "select", 
        target: "style", 
        responsive: true, 
        options: [{ label: "Row", value: "row" }, { label: "Column", value: "column" }] 
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
          { label: "End", value: "flex-end" }, 
          { label: "Space Between", value: "space-between" }
        ] 
      }
    ],
    defaultData: {
      props: {},
      style: {
        desktop: { backgroundColor: "#ffffff", paddingTop: "40px", paddingBottom: "40px", display: "flex", flexDirection: "column", gap: "5px",minHeight: "100px", width: "100%" },
      },
    },
  },

  // ========================
  // HERO
  // ========================
  hero: {
    component: HeroBlock,
    label: "Hero Section",
    icon: React.createElement(StarIcon),
    isContainer: false,
    rules: {
      allowedParents: ["section"], 
    },
    fields: [
      { key: "headline", label: "Headline Text", type: "text", target: "props", validation: { required: true } },
      { key: "subtext", label: "Subtext Text", type: "textarea", target: "props" },
      { key: "primaryAction.label", label: "Button Label", type: "text", target: "props" },
      { key: "backgroundColor", label: "Background", type: "color", target: "style", responsive: true },
      { key: "minHeight", label: "Min Height", type: "text", target: "style", responsive: true, validation: { cssUnit: true } },
      { key: "headlineSize", label: "Headline Size", type: "text", target: "style", responsive: true, validation: { cssUnit: true } },
    ],
    defaultData: {
      props: {
        headline: "The Next Generation Builder",
        subtext: "Build semantic websites with a clean canonical runtime.",
        primaryAction: { label: "Explore Now", url: "#" },
      },
      style: {
        desktop: { backgroundColor: "#f5f5f5", textAlign: "center", paddingTop: "120px", paddingBottom: "120px", headlineSize: "64px", subtextSize: "20px", minHeight: "80vh" },
      },
    },
  },

  // ========================
  // TITLE
  // ========================
  title: {
    component: TitleBlock,
    label: "Title",
    icon: React.createElement(TitleIcon),
    isContainer: false,
    rules: {
      allowedParents: ["section", "hero", "flex","flexItem"],
    },
    fields: [
      { key: "content", label: "Content", type: "text", target: "props", validation: { required: true } },
      { key: "color", label: "Color", type: "color", target: "style", responsive: true },
      { key: "fontSize", label: "Font Size", type: "text", target: "style", responsive: true, validation: { cssUnit: true } },
      { 
        key: "textAlign", 
        label: "Align", 
        type: "select", 
        target: "style", 
        responsive: true, 
        options: [{ label: "Left", value: "left" }, { label: "Center", value: "center" }, { label: "Right", value: "right" }] 
      }
    ],
    defaultData: {
      props: { content: "New Title" },
      style: {
        desktop: { fontSize: "32px", color: "#222", fontWeight: "bold" },
      },
    },
  },

  // ========================
  // TEXT
  // ========================
  text: {
    component: TextBlock,
    label: "Text Block",
    icon: React.createElement(TextFieldsIcon),
    isContainer: false,
    rules: {
      allowedParents: ["section", "hero", "flex","flexItem"],
    },
    fields: [
      { 
        key: "content", 
        label: "Text Content", 
        type: "textarea", 
        target: "props",
        validation: { required: true } 
      },
      { 
        key: "fontSize", 
        label: "Font Size", 
        type: "text", 
        target: "style", 
        responsive: true,
        validation: { cssUnit: true } 
      },
      { 
        key: "lineHeight", 
        label: "Line Height", 
        type: "text", 
        target: "style", 
        responsive: true,
        validation: { number: true } 
      }
    ],
    defaultData: {
      props: { content: "Paragraph text content..." },
      style: { desktop: { fontSize: "16px", color: "#555", lineHeight: "1.6" } },
    },
  },

  // ========================
  // IMAGE
  // ========================
  image: {
    component: ImageBlock,
    label: "Image",
    icon: React.createElement(ImageIcon),
    isContainer: false,
    rules: {
      allowedParents: ["section", "hero", "flex","flexItem"],
    },
    fields: [
      { 
        key: "url", 
        label: "Source URL", 
        type: "text", 
        target: "props",
        validation: { required: true, url: true } 
      },
      { 
        key: "borderRadius", 
        label: "Corner Radius", 
        type: "text", 
        target: "style", 
        responsive: true,
        validation: { cssUnit: true }
      }
    ],
    defaultData: {
      props: { url: "https://via.placeholder.com/600x400", alt: "" },
      style: { desktop: { width: "100%", borderRadius: "8px" } },
    },
  },

  // ========================
  // BUTTON
  // ========================
  button: {
    component: ButtonBlock,
    label: "Button",
    icon: React.createElement(SmartButtonIcon),
    isContainer: false,
    rules: {
      allowedParents: ["section", "hero", "flex", "flexItem"],
    },
    fields: [
      { key: "label", label: "Label", type: "text", target: "props", validation: { required: true } },
      { key: "url", label: "Link", type: "text", target: "props", validation: { url: true } },
      { 
        key: "variant", 
        label: "Style Variant", 
        type: "select", 
        target: "props", 
        options: [
          { label: "Contained", value: "contained" },
          { label: "Outlined", value: "outlined" },
          { label: "Text", value: "text" }
        ]
      },
      { key: "backgroundColor", label: "Color", type: "color", target: "style", responsive: true }
    ],
    defaultData: {
      props: { label: "Click Me", url: "#", variant: "contained" },
      style: { desktop: { backgroundColor: "#1976d2", color: "#fff" } },
    },
  },
  // ========================
  // FLEX
  // ========================


  flex: {
    component: FlexBlock,
    label: "Flex Layout",
    icon: React.createElement(ViewColumnIcon),
    isContainer: true,
    allowedChildren: ["flexItem"], 
    fields: [
      { key: "flexDirection", label: "Direction", type: "select", target: "style", options: [{ label: "Row", value: "row" }, { label: "Column", value: "column" }] },
      { key: "gap", label: "Gap (px)", type: "text", target: "style" },
    ],
    defaultData: {
      props: {},
      style: { desktop: { flexDirection: "row", gap: "20px" } }
    }
  },

  flexItem: {
    component: FlexItemBlock,
    label: "Column",
    icon: React.createElement(ViewColumnIcon),
    isContainer: true,
    allowedChildren: ["text", "title", "image", "button", "hero","flex","section"],
    rules: { allowedParents: ["flex"] },
    fields: [
      { 
        key: "flex", 
        label: "Column Width (Ratio)",
        type: "select", 
        target: "style",
        responsive: true,
       options: [
       { label: "1 (Equal)", value: "1" },
      { label: "2 (Double)", value: "2" },
      { label: "3 (Triple)", value: "3" },
      { label: "4 (Extra)", value: "4" },
      { label: "Fixed Width (Auto)", value: "0 0 auto" }
      ]
    },
    { 
      key: "padding", 
      label: "Padding", 
      type: "text", 
      target: "style", 
      responsive: true,
      validation: { cssUnit: true }
    },
    { 
      key: "backgroundColor", 
      label: "Background Color", 
      type: "color", 
      target: "style", 
      responsive: true 
    },
    { 
      key: "minHeight", 
      label: "Min Height (px)", 
      type: "text", 
      target: "style", 
      responsive: true 
      }
    ],
    defaultData: {
      props: {},
      style: { desktop: { flex: "1", padding: "10px"} }
    }
  }
};


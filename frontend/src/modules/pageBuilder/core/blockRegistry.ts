// src/modules/pageBuilder/core/blockRegistry.ts

import React from "react";

import {
  BlockConfig,
  BlockType,
} from "../types/page.types";

// ========================
// BLOCK COMPONENTS
// ========================

import { SectionBlock } from "../components/blocks/SectionBlock";
import { TextBlock } from "../components/blocks/TextBlock";
import { TitleBlock } from "../components/blocks/TitleBlock";
import { ImageBlock } from "../components/blocks/ImageBlock";
import { ButtonBlock } from "../components/blocks/ButtonBlock";
import { HeroBlock } from "../components/blocks/HeroBlock";

// ========================
// ICONS
// ========================

import ViewQuiltIcon from "@mui/icons-material/ViewQuilt";
import TextFieldsIcon from "@mui/icons-material/TextFields";
import TitleIcon from "@mui/icons-material/Title";
import ImageIcon from "@mui/icons-material/Image";
import SmartButtonIcon from "@mui/icons-material/SmartButton";
import StarIcon from "@mui/icons-material/Star";

// ========================
// REGISTRY
// ========================

export const blockRegistry:
Record<BlockType, BlockConfig> = {

  // ========================
  // SECTION
  // ========================

  section: {
    component: SectionBlock,

    label: "Section",

    icon: React.createElement(
      ViewQuiltIcon
    ),

    isContainer: true,

    allowedChildren: [
      "text",
      "image",
      "button",
      "title",
      "hero",
    ],

    fields: [

  {
    key: "backgroundColor",
    label: "Background",
    type: "color",
    target: "style",
    responsive: true,
  },

  {
    key: "paddingTop",
    label: "Padding Top",
    type: "text",
    target: "style",
    responsive: true,
  },

  {
    key: "paddingBottom",
    label: "Padding Bottom",
    type: "text",
    target: "style",
    responsive: true,
  },

  {
    key: "gap",
    label: "Gap",
    type: "text",
    target: "style",
    responsive: true,
  },

  {
    key: "flexDirection",
    label: "Direction",
    type: "select",
    target: "style",
    responsive: true,

    options: [
      {
        label: "Row",
        value: "row",
      },

      {
        label: "Column",
        value: "column",
      },
    ],
  },

  {
    key: "justifyContent",
    label: "Justify",
    type: "select",
    target: "style",
    responsive: true,

    options: [
      {
        label: "Start",
        value: "flex-start",
      },

      {
        label: "Center",
        value: "center",
      },

      {
        label: "End",
        value: "flex-end",
      },

      {
        label: "Space Between",
        value: "space-between",
      },
    ],
  },

  {
    key: "alignItems",
    label: "Align",
    type: "select",
    target: "style",
    responsive: true,

    options: [
      {
        label: "Start",
        value: "flex-start",
      },

      {
        label: "Center",
        value: "center",
      },

      {
        label: "End",
        value: "flex-end",
      },

      {
        label: "Stretch",
        value: "stretch",
      },
    ],
  },
],

    defaultData: {
      props: {},

      style: {
        desktop: {
          backgroundColor:
            "#ffffff",

          paddingTop: "40px",

          paddingBottom:
            "40px",

          display: "flex",

          flexDirection:
            "column",

          gap: "20px",

          width: "100%",
        },
      },
    },
  },

 // ========================
  // HERO SECTION
  // ========================
  hero: {
    component: HeroBlock,
    label: "Hero Section",
    icon: React.createElement(StarIcon),
    isContainer: false,

    fields: [
      // --- Content (Props) ---
      { key: "headline", label: "Headline Text", type: "text", target: "props" },
      { key: "subtext", label: "Subtext Text", type: "text", target: "props" },
      { key: "primaryAction.label", label: "Button Text", type: "text", target: "props" },
      { key: "primaryAction.url", label: "Button URL", type: "text", target: "props" },

      // --- Responsive Styles (Style) ---
      { key: "headlineSize", label: "Headline Size", type: "text", target: "style", responsive: true },
      { key: "subtextSize", label: "Subtext Size", type: "text", target: "style", responsive: true },
      { key: "minHeight", label: "Section Height", type: "text", target: "style", responsive: true },
      {
        key: "textAlign",
        label: "Alignment",
        type: "select",
        target: "style",
        responsive: true,
        options: [
          { label: "Left", value: "left" },
          { label: "Center", value: "center" },
          { label: "Right", value: "right" },
        ],
      },
      { key: "backgroundColor", label: "Background Color", type: "color", target: "style", responsive: true },
    ],

    defaultData: {
      props: {
        headline: "The Next Generation Builder",
        subtext: "Build semantic websites with a clean canonical runtime.",
        primaryAction: { label: "Explore Now", url: "#" },
      },
      style: {
        desktop: {
          backgroundColor: "#f5f5f5",
          textAlign: "center",
          paddingTop: "120px",
          paddingBottom: "120px",
          headlineSize: "64px",
          subtextSize: "20px",
          minHeight: "80vh",
        },
        tablet: {
          backgroundColor: "#f5f5f5",
          textAlign: "center",
          paddingTop: "80px",
          paddingBottom: "80px",
          fontSizeHeadline: "48px",
          fontSizeSubtext: "18px",
          minHeight: "60vh",
        },
        mobile: {
          backgroundColor: "#f5f5f5",
          textAlign: "center", 
          paddingTop: "40px",
          paddingBottom: "40px",
          fontSizeHeadline: "32px", // 📱 صغرناه باش يركح في الموبايل
          fontSizeSubtext: "16px",
          minHeight: "50vh", // 📱 نقصنا الـ Height باش يتنحى الـ Overflow
        },
      },
    },
  },


  // ========================
  // TITLE
  // ========================

  title: {
    component: TitleBlock,

    label: "Title",

    icon: React.createElement(
      TitleIcon
    ),

    isContainer: false,

    allowedChildren: [],

    fields: [
      {
        key: "content",
        label: "Text",
        type: "text",
        target: "props",
      },

      {
        key: "color",
        label: "Color",
        type: "color",
        target: "style",
      },
    ],

    defaultData: {
      props: {
        content:
          "New Title",
      },

      style: {
        desktop: {
          fontSize:
            "32px",

          color: "#222",

          fontWeight:
            "bold",
        },
      },
    },
  },

  // ========================
  // TEXT
  // ========================

  text: {
    component: TextBlock,

    label: "Text Block",

    icon: React.createElement(
      TextFieldsIcon
    ),

    isContainer: false,

    allowedChildren: [],

    fields: [
      {
        key: "content",
        label: "Content",
        type: "text",
        target: "props",
      },
    ],

    defaultData: {
      props: {
        content:
          "Paragraph text content...",
      },

      style: {
        desktop: {
          fontSize:
            "16px",

          color: "#555",

          lineHeight:
            "1.6",
        },
      },
    },
  },

  // ========================
  // IMAGE
  // ========================

  image: {
    component: ImageBlock,

    label: "Image",

    icon: React.createElement(
      ImageIcon
    ),

    isContainer: false,

    allowedChildren: [],

    fields: [
      {
        key: "url",
        label: "Image URL",
        type: "text",
        target: "props",
      },

      {
        key: "alt",
        label: "Alt Text",
        type: "text",
        target: "props",
      },
    ],

    defaultData: {
      props: {
        url:
          "https://via.placeholder.com/600x400",

        alt:
          "image description",
      },

      style: {
        desktop: {
          width: "100%",

          borderRadius:
            "8px",
        },
      },
    },
  },

  // ========================
  // BUTTON
  // ========================

  button: {
    component: ButtonBlock,

    label: "Button",

    icon: React.createElement(
      SmartButtonIcon
    ),

    isContainer: false,

    allowedChildren: [],

    fields: [
      {
        key: "label",
        label: "Label",
        type: "text",
        target: "props",
      },

      {
        key: "url",
        label: "Link URL",
        type: "text",
        target: "props",
      },
    ],

    defaultData: {
      props: {
        label:
          "Click Here",

        url: "#",
      },

      style: {
        desktop: {
          backgroundColor:
            "#1976d2",

          color:
            "#ffffff",

          padding:
            "12px 24px",

          borderRadius:
            "4px",

          border: "none",

          cursor:
            "pointer",

          fontSize:
            "16px",
        },
      },
    },
  },
};
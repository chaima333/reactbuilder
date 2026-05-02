import { TextBlock } from "../components/blocks/TextBlock";
import { ImageBlock } from "../components/blocks/ImageBlock";
import { TitleBlock } from "../components/blocks/TitleBlock";
import { ButtonBlock } from "../components/blocks/ButtonBlock";
import { SectionBlock } from "../components/blocks/SectionBlock";

import { BlockConfig } from "../types/page.types";

export const blockRegistry: Record<string, BlockConfig> = {

  section: {
    component: SectionBlock,
    label: "Section",
    isContainer: true,
    allowedChildren: ["text", "image", "button", "title"],
    fields: [
      { key: "backgroundColor", label: "Fond", type: "color", target: "style" },
      { key: "padding", label: "Padding", type: "text", target: "style" },
      { key: "flexDirection", label: "Direction", type: "select", options: ["row", "column"], target: "style" }
    ],
    defaultData: {
      props: {},
      style: {
        desktop: {
          backgroundColor: "#ffffff",
          padding: "40px 20px",
          display: "flex",
          flexDirection: "column",
          gap: "20px",
          width: "100%",
        }
      }
    }
  },

  title: {
    component: TitleBlock,
    label: "Title",
    isContainer: false,
    allowedChildren: [],
    fields: [
      { key: "content", label: "Text", type: "text", target: "props" },
      { key: "color", label: "Color", type: "color", target: "style" }
    ],
    defaultData: {
      props: { content: "New Title" },
      style: {
        desktop: { fontSize: "32px", color: "#222" }
      }
    }
  },

  text: {
    component: TextBlock,
    label: "Text",
    isContainer: false,
    allowedChildren: [],
    fields: [
      { key: "content", label: "Text", type: "text", target: "props" }
    ],
    defaultData: {
      props: { content: "Paragraph..." },
      style: {
        desktop: { fontSize: "16px", color: "#555" }
      }
    }
  },

  image: {
    component: ImageBlock,
    label: "Image",
    isContainer: false,
    allowedChildren: [],
    fields: [
      { key: "url", label: "Image URL", type: "text", target: "props" }
    ],
    defaultData: {
      props: {
        url: "https://via.placeholder.com/300",
        alt: "image"
      },
      style: {
        desktop: {
          width: "100%"
        }
      }
    }
  },

  button: {
    component: ButtonBlock,
    label: "Button",
    isContainer: false,
    allowedChildren: [],
    fields: [
      { key: "label", label: "Label", type: "text", target: "props" }
    ],
    defaultData: {
      props: {
        label: "Click me",
        url: "#"
      },
      style: {
        desktop: {
          backgroundColor: "#1976d2",
          color: "#fff",
          padding: "12px 20px"
        }
      }
    }
  }
};
import type {
  SerializedBlock
} from "../../../types/document/serialized.types";

import type {
  FigmaSemanticNode
} from "./figmaToSemanticTree";
import { figmaColorToHex } from "./mapFigmaStyles";

const responsive = (
  desktop: Record<string, any>,
  tablet: Record<string, any> = {},
  mobile: Record<string, any> = {}
) => ({
  desktop,
  tablet,
  mobile
});

const primitiveTypes = new Set([
  "title",
  "text",
  "image",
  "button",
  "link"
]);

const getFontSize = (node: FigmaSemanticNode) =>
  node.source.style?.fontSize || 16;

const getWidth = (node: FigmaSemanticNode) =>
  node.source.absoluteBoundingBox?.width || 0;

const getHeight = (node: FigmaSemanticNode) =>
  node.source.absoluteBoundingBox?.height || 0;

const makeTextBlock = (
  node: FigmaSemanticNode,
  contextMaxFontSize: number
): SerializedBlock => {
  const content = node.source.characters || "";
  const size = getFontSize(node);

  const trimmed = content.trim();

  const words = trimmed
    ? trimmed.split(/\s+/).length
    : 0;

  const lines = trimmed
    ? trimmed.split(/\n+/).length
    : 0;

  const isTitle =
    contextMaxFontSize > 0 &&
    size >= contextMaxFontSize * 0.9 &&
    words <= 6 &&
    lines <= 2;

  return {
    id: node.id,
    type: isTitle ? "title" : "text",
    data: {
      props: {
        content,
        ...(isTitle ? { level: "h2" } : {})
      },
      style: responsive({
        fontSize: `${size}px`,
        fontWeight: node.source.style?.fontWeight || 400,
        fontFamily: node.source.style?.fontFamily || "Inter",
        lineHeight: "1.35"
      })
    },
    children: []
  };
};
const makeImagePlaceholder = (
  node: FigmaSemanticNode
): SerializedBlock => {
  const imageUrl =
    node.source.imageBase64
      ? `data:${node.source.imageMimeType || "image/png"};base64,${node.source.imageBase64}`
      : "";

  if (imageUrl) {
    return {
      id: node.id,
      type: "image",
      data: {
        props: {
          url: imageUrl,
          src: imageUrl,
          alt: node.name
        },
        style: responsive(
          {
            width: "100%",
            height: `${Math.max(getHeight(node), 180)}px`,
            objectFit: "cover"
          },
          {
            width: "100%",
            height: "240px",
            objectFit: "cover"
          },
          {
            width: "100%",
            height: "200px",
            objectFit: "cover"
          }
        )
      },
      children: []
    };
  }

  return {
    id: node.id,
    type: "flex",
    data: {
      props: {
        semantic: {
          source: "figma",
          role: "media-placeholder"
        }
      },
      style: responsive(
        {
          width: "100%",
          height: `${Math.max(getHeight(node), 180)}px`,
          backgroundColor: "#d9d9d9"
        },
        {
          width: "100%",
          height: "240px",
          backgroundColor: "#d9d9d9"
        },
        {
          width: "100%",
          height: "200px",
          backgroundColor: "#d9d9d9"
        }
      )
    },
    children: []
  };
};
const wrapInFlexItem = (
  block: SerializedBlock
): SerializedBlock => ({
  id: `${block.id}-item`,
  type: "flexItem",
  data: {
    props: {},
    style: responsive({
      width: "100%",
      minWidth: "0"
    })
  },
  children: [block]
});

const getContextMaxFontSize = (
  node: FigmaSemanticNode
): number =>
  Math.max(
    0,
    ...node.children
      .filter(child => child.type === "text")
      .map(child => getFontSize(child))
  );

const buildNode = (
  node: FigmaSemanticNode,
  contextMaxFontSize = 0
): SerializedBlock | null => {
  if (node.type === "text") {
    return makeTextBlock(
      node,
      contextMaxFontSize
    );
  }

  if (node.type === "image") {
    return makeImagePlaceholder(node);
  }

  if (node.type === "card") {
    const maxFontSize =
      getContextMaxFontSize(node);

    const children = node.children
      .map(child =>
        buildNode(child, maxFontSize)
      )
      .filter((block): block is SerializedBlock => block !== null)
      .map(block =>
        primitiveTypes.has(block.type)
          ? wrapInFlexItem(block)
          : block
      );

    return {
      id: node.id,
      type: "flex",
      data: {
        props: {
          semantic: {
            source: "figma",
            role: "card"
          }
        },
        style: responsive({
          display: "flex",
          flexDirection: "column",
          gap: "12px",
          padding: "20px",
          backgroundColor: "#d9d9d9",
          width: "100%"
        })
      },
      children
    };
  }

  if (node.type === "column" || node.type === "row") {
    const isRow = node.type === "row";
    const maxFontSize = getContextMaxFontSize(node);

    const children = node.children
      .map(child =>
        buildNode(child, maxFontSize)
      )
      .filter((block): block is SerializedBlock => block !== null)
      .map(block =>
        primitiveTypes.has(block.type)
          ? wrapInFlexItem(block)
          : block
      );

    return {
      id: node.id,
      type: "flex",
      data: {
        props: {},
        style: responsive(
          {
            display: "flex",
            flexDirection: isRow ? "row" : "column",
            gap: "24px",
            width: "100%"
          },
          {
            display: "flex",
            flexDirection: "column",
            gap: "20px",
            width: "100%"
          },
          {
            display: "flex",
            flexDirection: "column",
            gap: "16px",
            width: "100%"
          }
        )
      },
      children
    };
  }

  if (node.type === "section") {
    const maxFontSize = getContextMaxFontSize(node);

    const builtChildren = node.children
      .map(child =>
        buildNode(child, maxFontSize)
      )
      .filter((block): block is SerializedBlock => block !== null);

    const columns =
      node.children.filter(child => child.type === "column");

    const hasTwoColumns =
      columns.length >= 2;

    let desktopColumns = "1fr";

    if (hasTwoColumns) {
      const leftWidth = getWidth(columns[0]);
      const rightWidth = getWidth(columns[1]);
      const total = leftWidth + rightWidth;

      const leftPercent =
        total > 0
          ? Math.max(
              25,
              Math.min(
                45,
                Math.round((leftWidth / total) * 100)
              )
            )
          : 32;

      desktopColumns = `${leftPercent}% 1fr`;
    }

    const backgroundColor =
      node.source.fills?.[0]?.type === "SOLID" &&
      node.source.fills[0].color
        ? figmaColorToHex(node.source.fills[0].color)
        : "transparent";
console.log(
  "SECTION FILL",
  node.source.fills
);
console.log(
  "SECTION BG",
  backgroundColor
);
    return {
      id: node.id,
      type: "section",
      data: {
        props: {},
        style: responsive(
          {
            padding: "48px",
            backgroundColor
          },
          {
            padding: "32px",
            backgroundColor
          },
          {
            padding: "20px",
            backgroundColor
          }
        )
      },
      children: [
        {
          id: `${node.id}-grid`,
          type: "grid",
          data: {
            props: {},
            style: responsive(
              {
                display: "grid",
                gridTemplateColumns: desktopColumns,
                gap: "32px",
                width: "100%"
              },
              {
                display: "grid",
                gridTemplateColumns: "1fr",
                gap: "24px",
                width: "100%"
              },
              {
                display: "grid",
                gridTemplateColumns: "1fr",
                gap: "16px",
                width: "100%"
              }
            )
          },
          children: builtChildren.map((child, index) => ({
            id: `${child.id}-gridItem-${index}`,
            type: "gridItem",
            data: {
              props: {},
              style: responsive({
                width: "100%",
                minWidth: "0"
              })
            },
            children: [child]
          }))
        }
      ]
    };
  }

  return null;
};

export const semanticTreeToBlocks = (
  node: FigmaSemanticNode
): SerializedBlock[] => {
  const root = buildNode(node);

  return root ? [root] : [];
};
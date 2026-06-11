
import {
  mapFrameStyles,
  mapTextStyles
} from "./mapFigmaStyles";


import type {
  SerializedBlock
} from "../../../types/document/serialized.types";
import { resolveComponentType } from "./resolveComponentType";
import { FigmaNode } from "./figma.types";

const isPrimitiveBlock = (
  block: SerializedBlock
) =>
  [
    "title",
    "text",
    "button",
    "link",
    "image",
    "input",
    "textarea",
    "select"
  ].includes(block.type);

const wrapPrimitiveInFlexItem = (
  block: SerializedBlock
): SerializedBlock => ({
  id: `${block.id}-item`,
  type: "flexItem",
  data: {
    props: {},
    style: {
      desktop: {
        width: "100%"
      },
      tablet: {},
      mobile: {}
    }
  },
  children: [
    block
  ]
});

const shouldSkipNode = (
  node: FigmaNode
): boolean => {
  return (
    node.type === "VECTOR" ||
    node.type === "ELLIPSE" ||
    node.opacity === 0
  );
};

const mapTextToBlock = (
  node: FigmaNode
): SerializedBlock => {
  const isTitle =
    (node.style?.fontSize ?? 16) > 28;

  return {
    id: node.id,
    type: isTitle ? "title" : "text",
    data: {
      props: {
        content:
          node.characters || ""
      },
      style:
        mapTextStyles(
          node
        )
    },
    children: []
  };
};

const mapFrameToBlock = (
  node: FigmaNode,
  isTopLevel = false
): SerializedBlock => {
  const isAutoLayout =
    node.layoutMode === "HORIZONTAL" ||
    node.layoutMode === "VERTICAL";

  const rawChildren =
    (node.children || [])
      .map(child =>
        figmaNodeToBlock(
          child
        )
      )
      .filter(
        (block): block is SerializedBlock =>
          block !== null
      );

  const children =
    rawChildren.map(child =>
      isPrimitiveBlock(child)
        ? wrapPrimitiveInFlexItem(child)
        : child
    );

  return {
    id: node.id,
    type:
      isTopLevel
        ? "section"
        : isAutoLayout
          ? "flex"
          : "flex",
    data: {
      props: {},
      style:
        mapFrameStyles(
          node
        )
    },
    children
  };
};

const mapGroupToBlock = (
  node: FigmaNode
): SerializedBlock | null => {
  const children =
    (node.children || [])
      .map(child =>
        figmaNodeToBlock(
          child
        )
      )
      .filter(
        (block): block is SerializedBlock =>
          block !== null
      );

  if (children.length === 0) {
    return null;
  }

  return {
    id: node.id,
    type: "flex",
    data: {
      props: {},
      style: {
        desktop: {
          display: "flex",
          flexDirection: "column",
          gap: "12px"
        },
        tablet: {},
        mobile: {}
      }
    },
    children:
      children.map(child =>
        isPrimitiveBlock(child)
          ? wrapPrimitiveInFlexItem(child)
          : child
      )
  };
};

const mapRectangleToBlock = (
  node: FigmaNode
): SerializedBlock | null => {
  if (
    node.fills?.some(fill =>
      fill.type === "IMAGE"
    )
  ) {
    return {
      id: node.id,
      type: "image",
      data: {
        props: {
          src: ""
        },
        style:
          mapFrameStyles(
            node
          )
      },
      children: []
    };
  }

  return null;
};

export const figmaNodeToBlock = (
  node: FigmaNode,
  isTopLevel = false
): SerializedBlock | null => {
  if (
    shouldSkipNode(
      node
    )
  ) {
    return null;
  }

  switch (node.type) {
    case "FRAME":
    case "COMPONENT":
    case "SECTION":
      return mapFrameToBlock(
        node,
        isTopLevel
      );

    case "GROUP":
      return mapGroupToBlock(
        node
      );

    case "TEXT":
      return mapTextToBlock(
        node
      );

    case "RECTANGLE":
      return mapRectangleToBlock(
        node
      );

    case "INSTANCE":
      return resolveComponentType(
        node
      );

    default:
      return null;
  }
};
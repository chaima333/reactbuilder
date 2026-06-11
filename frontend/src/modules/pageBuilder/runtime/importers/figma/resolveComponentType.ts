
import {
  mapFrameStyles
} from "./mapFigmaStyles";

import type {
  SerializedBlock
} from "../../../types/document/serialized.types";
import { FigmaNode } from "./figma.types";

export const resolveComponentType = (
  node: FigmaNode
): SerializedBlock | null => {
  const name =
    node.name.toLowerCase();

  if (
    name.includes("button") ||
    name.includes("btn") ||
    name.includes("cta")
  ) {
    return {
      id: node.id,
      type: "button",
      data: {
        props: {
          label:
            node.children
              ?.find(child => child.type === "TEXT")
              ?.characters ||
            node.name
        },
        style:
          mapFrameStyles(
            node
          )
      },
      children: []
    };
  }

  return {
    id: node.id,
    type: "flex",
    data: {
      props: {},
      style:
        mapFrameStyles(
          node
        )
    },
    children: []
  };
};
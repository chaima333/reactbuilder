

import type { BlockType } from "../../types/page.types";

export const semanticDroppableTypes = [
  "root",
  "section",
  "flex",
  "grid",
  "flexItem",
  "gridItem"
];

export const isSemanticDroppableElement = (
  element: Element
): element is HTMLElement => {

  if (!(element instanceof HTMLElement)) {
    return false;
  }

  const droppable =
    element.dataset.droppableContainer;

  const blockType =
    element.dataset.blockType;

  const blockId =
    element.dataset.blockId;

  console.log(
    "SEMANTIC DATA",
    {
      id: element.id,
      droppable,
      blockType,
      blockId
    }
  );

  return (
    droppable === "true" &&
    !!blockType &&
    !!blockId &&
    semanticDroppableTypes.includes(
      blockType
    )
  );
};

export const getSemanticDroppableId = (
  element: HTMLElement
) =>
  element.dataset.blockId || "";
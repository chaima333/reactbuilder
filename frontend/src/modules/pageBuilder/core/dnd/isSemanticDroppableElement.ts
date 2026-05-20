import type { BlockType } from "../../types/page.types";

export const semanticDroppableTypes: BlockType[] = [
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

  const blockType =
    element.dataset.blockType as BlockType | undefined;

  return (
    element.dataset.droppableContainer === "true" &&
    element.id.startsWith("pb-runtime-") &&
    !!blockType &&
    semanticDroppableTypes.includes(blockType)
  );
};

export const getSemanticDroppableId = (
  element: HTMLElement
) => element.id.replace("pb-runtime-", "");

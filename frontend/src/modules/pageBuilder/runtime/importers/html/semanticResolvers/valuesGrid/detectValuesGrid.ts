import type {
  StructuralNode
} from "../../structure/buildStructuralGraph";
import {
  getOwnerComputedStyle
} from "../../domGuards";

export const detectValuesGrid = (
  node: StructuralNode
): boolean => {

  const element =
    node.element;

  const children =

    Array.from(
      element.children
    );

  if (
    children.length < 3
  ) {

    return false;
  }

  const cardCount =

    children.filter(
      child => {

        const hasTitle =

          !!child.querySelector(
            "h1,h2,h3,h4,h5,h6,.letter"
          );

        const hasText =

          !!child.querySelector(
            "p"
          );

        return (
          hasTitle &&
          hasText
        );
      }
    ).length;

  if (
    cardCount < 3
  ) {

    return false;
  }

  const computed =

    getOwnerComputedStyle(
      element
    );

  const isGrid =

    computed.display ===
      "grid";

  const gridCandidate =

    node.candidates.some(
      candidate =>

        candidate.type === "GRID" ||

        candidate.metadata?.layoutMode ===
          "GRID"
    );

  return (
    isGrid ||
    gridCandidate
  );
};

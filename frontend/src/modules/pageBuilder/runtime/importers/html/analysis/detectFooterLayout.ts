import type {
  StructuralCandidate
} from "./StructuralCandidate.types";
import {
  shouldSkipImportedElement
} from "../domGuards";

export const detectFooterLayout = (
  element: HTMLElement,
  path: (string | number)[],
  getElementId: (
    element: HTMLElement
  ) => string
): StructuralCandidate[] => {
  if (
    shouldSkipImportedElement(
      element
    ) ||
    element.tagName !== "FOOTER"
  ) {
    return [];
  }

  return [
    {
      type: "FOOTER",
      confidence: 1,
      path,
      elementId:
        getElementId(
          element
        ),
      metadata: {
        semanticIntent:
          "FOOTER",
        childCount:
          element.children.length
      }
    }
  ];
};

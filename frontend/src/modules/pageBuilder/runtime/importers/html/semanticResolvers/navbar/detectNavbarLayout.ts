// semantic/navbar/detectNavbarLayout.ts

import type {
  StructuralCandidate
} from "../../analysis/StructuralCandidate.types";

import {
  isNavbarLayout
} from "./isNavbarLayout";
import {
  getOwnerComputedStyle,
  shouldSkipImportedElement
} from "../../domGuards";

export const detectNavbarLayout = (
  element: HTMLElement,
  path: (string | number)[],
  getElementId: (
    element: HTMLElement
  ) => string
): StructuralCandidate[] => {

  if (
    shouldSkipImportedElement(
      element
    )
  ) {

    return [];
  }

  console.log(
  "🔥 NAVBAR CHECK",
  {
    tag:
      element.tagName,

    display:
      getOwnerComputedStyle(
        element
      )
        .display,

    links:
      element.querySelectorAll(
        "a"
      ).length
  }
);

  // =====================================
  // VALIDATION
  // =====================================

  if (
    !isNavbarLayout(
      element
    )
  ) {

    return [];
  }

  // =====================================
  // CANDIDATE
  // =====================================

  return [

    {

      type:
        "FLEX_GROUP",

      confidence:
        0.95,

      path,

      elementId:
        getElementId(
          element
        ),

      metadata: {

        semanticIntent:
          "NAVBAR"
      }
    }
  ];
};

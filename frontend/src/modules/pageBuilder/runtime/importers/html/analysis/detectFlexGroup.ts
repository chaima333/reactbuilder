import {
  StructuralCandidate
} from "./StructuralCandidate.types";
import {
  getElementClassNameLower,
  getOwnerComputedStyle,
  shouldSkipImportedElement
} from "../domGuards";

export const detectFlexGroup = (
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

  const className =

  getElementClassNameLower(
    element
  );

const semanticClasses = [

  "values-grid",
  "vision-pillars",
  "office-row",
  "mission-grid"
];

if (

  semanticClasses.some(
    cls =>
      className.includes(cls)
  )
) {

  return [];
}

const computed =

  getOwnerComputedStyle(
    element
  );

// MUST BE FLEX

if (
  computed.display !==
  "flex"
) {

  return [];
}

  const children =
    Array.from(
      element.children
    );

  // TOO SMALL
  if (
    children.length < 2
  ) {
    return [];
  }


  // =====================================
  // FLEX GROUP
  // =====================================

  return [
    {
      type:
        "FLEX_GROUP",

      confidence:
        0.8,

      path,

      elementId:
        getElementId(
          element
        ),

      metadata: {
        childCount:
          children.length
      }
    }
  ];
};

// semantic/navbar/isNavbarLayout.ts

import {
  getOwnerComputedStyle,
  getTagNameLower,
  shouldSkipImportedElement
} from "../../domGuards";

export const isNavbarLayout = (
  element: HTMLElement
) => {

  if (
    shouldSkipImportedElement(
      element
    )
  ) {

    return false;
  }

  if (
  element.tagName === "NAV"
) {
  return true;
}

  // =====================================
  // TAG
  // =====================================

  const tag =
    getTagNameLower(
      element
    );

  // =====================================
  // LINKS
  // =====================================

  const links =
    element.querySelectorAll(
      "a"
    );

  // =====================================
  // COMPUTED STYLE
  // =====================================

  const computedStyle =

    getOwnerComputedStyle(
      element
    );

  // =====================================
  // HORIZONTAL
  // =====================================

 const horizontal =

  computedStyle.display ===
    "flex";

  // =====================================
  // RESULT
  // =====================================

  return (

    (tag === "nav" ||
     tag === "header") &&

    links.length >= 2 &&

    horizontal
  );
};

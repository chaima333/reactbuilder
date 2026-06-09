import type {
  StructuralNode
} from "../../structure/buildStructuralGraph";
import {
  getElementClassName,
  getElementClassNameLower,
  shouldSkipImportedElement
} from "../../domGuards";

export const detectHero = (
  node: StructuralNode
): boolean => {

  if (
    shouldSkipImportedElement(
      node.element
    )
  ) {

    return false;
  }

  const heroCandidate =

    node.candidates.some(
      candidate =>

        candidate.metadata?.semanticIntent ===
          "HERO" ||

        candidate.metadata?.semanticIntent ===
          "HERO_SECTION"
    );

  // =====================================
  // EXPLICIT HERO CANDIDATE
  // =====================================

  if (
    heroCandidate
  ) {

    return true;
  }

  // =====================================
  // HERO CONTAINER ONLY
  // =====================================

  const isHeroContainer =

    node.element.tagName ===
      "HEADER" ||

    getElementClassNameLower(
      node.element
    )
      .includes(
        "hero"
      );

  if (
    !isHeroContainer
  ) {

    return false;
  }

  // =====================================
  // HERO SIGNALS
  // =====================================

  const text =

    node.element.textContent
      ?.toLowerCase() || "";

  const hasHeading =

    !!node.element.querySelector(
      "h1"
    );

  console.log(
    "🔥 HERO CHECK",
    {
      className:
        getElementClassName(
          node.element
        ),

      tag:
        node.element.tagName,

      hasHeading,

      text
    }
  );

  // =====================================
  // FINAL DECISION
  // =====================================

  return (

    hasHeading &&

    text.length > 30
  );
};

import type {
  StructuralNode
} from "../../structure/buildStructuralGraph";
import {
  getElementClassName,
  getElementClassNameLower,
  shouldSkipImportedElement
} from "../../domGuards";

const hasHeroClass = (
  element: HTMLElement
) =>
  /\b(?:page-hero|hero)\b/i.test(
    getElementClassName(element)
  ) ||
  getElementClassNameLower(
    element
  ).includes("hero");

const hasLeadText = (
  element: HTMLElement
) =>
  !!element.querySelector(
    ".lead, [class*='lead'], p"
  );

const isElementLike = (
  value: Element
): value is HTMLElement =>
  !!value &&
  typeof (value as HTMLElement).tagName === "string" &&
  typeof (value as HTMLElement).querySelector === "function";

const looksLikeHeroRoot = (
  element: HTMLElement
) => {
  if (
    shouldSkipImportedElement(
      element
    )
  ) {
    return false;
  }

  const tag =
    element.tagName;

  const explicitHero =
    tag === "HEADER" ||
    tag === "SECTION" ||
    hasHeroClass(
      element
    );

  if (
    explicitHero &&
    !!element.querySelector("h1")
  ) {
    return true;
  }

  return (
    (
      tag === "HEADER" ||
      tag === "SECTION"
    ) &&
    !!element.querySelector("h1") &&
    hasLeadText(element)
  );
};

const hasNestedHeroRoot = (
  element: HTMLElement
) =>
  Array.from(
    element.querySelectorAll(
      "header, section, .hero, [class*='hero']"
    )
  ).some(
    candidate =>
      isElementLike(candidate) &&
      candidate !== element &&
      looksLikeHeroRoot(candidate)
  );

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

    looksLikeHeroRoot(
      node.element
    ) ||
    hasNestedHeroRoot(
      node.element
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

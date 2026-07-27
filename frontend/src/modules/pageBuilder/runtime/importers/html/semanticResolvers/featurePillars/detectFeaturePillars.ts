import type {
  StructuralNode
} from "../../structure/buildStructuralGraph";

const classText = (
  element: Element
) =>
  String(
    (element as HTMLElement).className || ""
  ).toLowerCase();

const isCardLike = (
  element: Element
) => {
  const className =
    classText(
      element
    );

  const hasTitle =
    !!element.querySelector(
      "h1,h2,h3,h4,h5,h6"
    );

  const hasText =
    !!element.querySelector(
      "p"
    );

  const hasCardIdentity =
    element.tagName.toLowerCase() === "article" ||
    className.includes("feat") ||
    className.includes("card") ||
    className.includes("pillar") ||
    className.includes("feature") ||
    className.includes("industry") ||
    className.includes("ind-");

  return (
    hasTitle &&
    hasText &&
    hasCardIdentity
  );
};

const getDirectCards = (
  element: HTMLElement
) =>
  Array.from(
    element.children
  ).filter(
    isCardLike
  );

const getNestedCards = (
  element: HTMLElement
) =>
  Array.from(
    element.querySelectorAll(
      "article, .feat, .ind-card, .feature-card, .pillar, .pillar-card, .card, [class*='feat'], [class*='card'], [class*='pillar'], [class*='feature']"
    )
  ).filter(
    child =>
      child !== element &&
      isCardLike(
        child
      )
  );

export const detectFeaturePillars = (
  node: StructuralNode
): boolean => {
  const element =
    node.element;

  const className =
    classText(
      element
    );

  const hasGridIdentity =
    className.includes("pillars") ||
    className.includes("pillar") ||
    className.includes("features") ||
    className.includes("feature") ||
    className.includes("feat") ||
    className.includes("feat-grid") ||
    className.includes("ind-grid") ||
    className.includes("industry") ||
    className.includes("grid");

  if (
    !hasGridIdentity
  ) {
    return false;
  }

  const directCards =
    getDirectCards(
      element
    );

  const nestedCards =
    getNestedCards(
      element
    );

  if (
    directCards.length >= 3
  ) {
    return true;
  }

  return (
    nestedCards.length >= 3
  );
};

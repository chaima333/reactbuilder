import type {
  StructuralNode
} from "../../structure/buildStructuralGraph";

const hasClassToken = (
  element: HTMLElement,
  token: string
) =>
  element.classList.contains(
    token
  );

const isCardLike = (
  element: Element
) => {
  const hasTitle =
    !!element.querySelector(
      "h1,h2,h3,h4,h5,h6"
    );

  const hasText =
    !!element.querySelector(
      "p"
    );

  return (
    hasTitle &&
    hasText
  );
};

export const detectFeaturePillars = (
  node: StructuralNode
): boolean => {
  const element =
    node.element;

  const className =
  element.className
    ?.toString()
    .toLowerCase() || "";

const isPillarsRoot =
  hasClassToken(
    element,
    "pillars"
  ) ||
  className.includes(
    "pillars"
  ) ||
  className.includes(
    "pillar"
  );
  if (!isPillarsRoot) {
    return false;
  }

  const children =
    Array.from(
      element.children
    );

  const cardCount =
    children.filter(
      child =>
        isCardLike(
          child
        )
    ).length;

  return (
    cardCount >= 3
  );
};
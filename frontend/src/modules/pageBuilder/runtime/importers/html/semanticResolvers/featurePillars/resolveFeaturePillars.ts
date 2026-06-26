import type {
  StructuralNode
} from "../../structure/buildStructuralGraph";

import type {
  FeaturePillarsPayload
} from "../../semanticContracts/FeaturePillarsPayload";

import {
  getElementClassName
} from "../../domGuards";

import {
  detectFeaturePillars
} from "./detectFeaturePillars";

import {
  extractFeaturePillars
} from "./extractFeaturePillars";

import {
  validateFeaturePillars
} from "./validateFeaturePillars";

const hasClassToken = (
  element: HTMLElement,
  token: string
) =>
  element.classList.contains(
    token
  );

const findExpandedClaimElement = (
  element: HTMLElement
) => {
  const className =
    element.className
      ?.toString()
      .toLowerCase() || "";

  const isPillarsElement =
    element.classList.contains("pillars") ||
    className.includes("pillars") ||
    className.includes("pillar");

  if (!isPillarsElement) {
    return element;
  }

  const section =
    element.closest(
      "section, article, main"
    ) as HTMLElement | null;

  if (
    section &&
    (
      section.querySelector(".pillars") ||
      section.querySelector("[class*='pillars']") ||
      section.querySelector("[class*='pillar']")
    ) &&
    section.querySelector(
      ".sec-head, h1, h2, h3, p"
    )
  ) {
    return section;
  }

  const container =
    element.closest(
      ".container"
    ) as HTMLElement | null;

  return (
    container ||
    element.parentElement ||
    element
  );
};
const createExpandedClaimNode = (
  node: StructuralNode
): StructuralNode => {
  const claimedElement =
    findExpandedClaimElement(
      node.element
    );

  if (
    claimedElement === node.element
  ) {
    return node;
  }

  return {
    ...node,
    element:
      claimedElement,
    path: [
      ...node.path,
      "featurePillarsClaim"
    ],
    children: [
      node
    ],
    claimed:
      false
  };
};

export const resolveFeaturePillars = (
  node: StructuralNode
): FeaturePillarsPayload | null => {
 console.log(
    "🚀 resolveFeaturePillars CALLED",
    node.element.className
  );
  // =====================================
  // DETECT
  // =====================================

  const detected =
    detectFeaturePillars(
      node
    );

  if (
    !detected
  ) {
    return null;
  }

  // =====================================
  // EXTRACT
  // Keep extraction rooted at the actual .pillars grid.
  // =====================================

  const items =
    extractFeaturePillars(
      node
    );

  // =====================================
  // VALIDATE
  // =====================================

  const valid =
    validateFeaturePillars(
      items
    );

  if (
    !valid
  ) {
    return null;
  }

  const claimedNode =
    createExpandedClaimNode(
      node
    );

  // =====================================
  // RESULT
  // =====================================

  return {
    type:
      "FEATURE_PILLARS",

    items,

    claimedNode,

    gridNode:
      node,

    sourceNode:
      node
  };
};

import type {
  StructuralNode
} from "../../structure/buildStructuralGraph";

import type {
  FeaturePillarsPayload
} from "../../semanticContracts/FeaturePillarsPayload";

import {
  detectFeaturePillars
} from "./detectFeaturePillars";

import {
  extractFeaturePillars
} from "./extractFeaturePillars";

import {
  validateFeaturePillars
} from "./validateFeaturePillars";

import {
  extractLayoutStyles,
  extractTypographyStyles
} from "../../../css/extractStyleProps";

const findFeatureSectionRoot = (
  element: HTMLElement
): HTMLElement => {
  const section =
    element.closest(
      "section"
    ) as HTMLElement | null;

  if (section) {
    return section;
  }

  return element;
};

const findFeatureGridRoot = (
  element: HTMLElement
): HTMLElement => {
  const selector =
    [
      ".feat-grid",
      ".feature-grid",
      ".features-grid",
      ".pillars",
      ".pillars-grid",
      ".industry-grid",
      ".ind-grid",
      "[class*='feat-grid']",
      "[class*='feature-grid']",
      "[class*='features-grid']",
      "[class*='pillars-grid']",
      "[class*='industry-grid']",
      "[class*='ind-grid']"
    ].join(",");

  const grid =
    (
      element.matches(selector)
        ? element
        : element.querySelector(selector)
    ) as HTMLElement | null;

  return grid || element;
};

const mergeElementStyles = (
  element?: HTMLElement | null
) => {
  if (!element) {
    return undefined;
  }

  return {
    desktop: {
      ...extractLayoutStyles(
        element
      ).desktop,
      ...extractTypographyStyles(
        element
      ).desktop
    },
    tablet: {},
    mobile: {}
  };
};

const findIntroElement = (
  sectionElement: HTMLElement,
  selector: string,
  excludedRoot?: HTMLElement | null
) =>
  Array.from(
    sectionElement.querySelectorAll(
      selector
    )
  ).find(
    element =>
      !excludedRoot ||
      !excludedRoot.contains(
        element
      )
  ) as HTMLElement | undefined;

export const resolveFeaturePillars = (
  node: StructuralNode
): FeaturePillarsPayload | null => {
 
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

  const featureGridElement =
    findFeatureGridRoot(
      node.element
    );

  const gridNode: StructuralNode = {
    ...node,
    element: featureGridElement,
    path: [
      ...node.path,
      "featurePillarsGrid"
    ],
    children: [],
    claimed: false
  };

  const items =
    extractFeaturePillars(
      gridNode
    );

  const valid =
    validateFeaturePillars(
      items
    );

  if (!valid) {
    return null;
  }

  const sectionElement =
    findFeatureSectionRoot(
      featureGridElement
    );

  const claimedNode: StructuralNode =
    gridNode;

  const titleElement =
    findIntroElement(
      sectionElement,
      ".sec-head h1, .sec-head h2, .sec-head h3, h1, h2, h3",
      featureGridElement
    );

  const descriptionElement =
    findIntroElement(
      sectionElement,
      ".sec-head p, .lead, p",
      featureGridElement
    );

  const eyebrowElement =
    findIntroElement(
      sectionElement,
      ".section-tag, .eyebrow, .badge, .pill, [class*='tag'], [class*='eyebrow'], [class*='badge'], [class*='pill']",
      featureGridElement
    );

  const containerElement =
    (
      featureGridElement.closest(
        ".container, [class~='container'], .inner, [class*='inner'], .wrap, [class*='wrap']"
      ) ||
      sectionElement.querySelector(
        ".container, [class~='container'], .inner, [class*='inner'], .wrap, [class*='wrap']"
      )
    ) as HTMLElement | null;

  const payload: FeaturePillarsPayload = {
    type: "FEATURE_PILLARS",
    items,
    claimedNode,
    gridNode,
    sourceNode: gridNode,
    suppressIntro: true,
    styles: { section:  mergeElementStyles( sectionElement  ),
      container:
        mergeElementStyles(
          containerElement
        ),
      eyebrow:
        mergeElementStyles(
          eyebrowElement
        ),
      title:
        mergeElementStyles(
          titleElement
        ),
      description:
        mergeElementStyles(
          descriptionElement
        ),
      grid:
        mergeElementStyles(
          featureGridElement
        )
    }
  };

  return payload;
};
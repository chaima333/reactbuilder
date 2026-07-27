import type {
  StructuralNode
} from "../../structure/buildStructuralGraph";

import {
  extractLayoutStyles,
  extractTypographyStyles
} from "../../../css/extractStyleProps";

const cleanText = (
  value?: string | null
) =>
  value
    ?.replace(/\s+/g, " ")
    .trim() || "";

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

const getCardElements = (
  element: HTMLElement
) => {
  const directCards =
    Array.from(
      element.children
    ).filter(
      isCardLike
    ) as HTMLElement[];

  if (
    directCards.length
  ) {
    return directCards;
  }

  return Array.from(
    element.querySelectorAll(
      "article, .feat, .ind-card, .feature-card, .pillar, .pillar-card, .card, [class*='feat'], [class*='card'], [class*='pillar'], [class*='feature']"
    )
  ).filter(
    child =>
      child !== element &&
      isCardLike(
        child
      )
  ) as HTMLElement[];
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

const getTagElements = (
  card: HTMLElement
) =>
  Array.from(
    card.querySelectorAll(
      ".topics span, .tags span, .chips span, .chip, .pill, .badge, .tag, [class*='chip'], [class*='pill'], [class*='badge'], [class*='tag']"
    )
  ).filter(
    (element): element is HTMLElement =>
      element instanceof HTMLElement &&
      !element.matches(".sub, .subtitle") &&
      !!cleanText(
        element.textContent
      )
  );

export const extractFeaturePillars = (
  node: StructuralNode
) => {
  const cards =
    getCardElements(
      node.element
    );

  return cards
    .map(
      (
        card,
        index
      ) => {
        const heading =
          card.querySelector(
            "h1,h2,h3,h4,h5,h6"
          );

        const subtitleElement =
          heading?.querySelector(
            ".sub, .subtitle, small"
          );

        const directTitle =
          heading
            ? Array.from(
                heading.childNodes
              )
                .filter(
                  childNode =>
                    childNode.nodeType ===
                    Node.TEXT_NODE
                )
                .map(
                  childNode =>
                    childNode.textContent || ""
                )
                .join(" ")
                .replace(/\s+/g, " ")
                .trim()
            : "";

        const title =
          directTitle ||
          cleanText(
            heading?.textContent
          )
            .replace(
              cleanText(
                subtitleElement?.textContent
              ),
              ""
            )
            .trim();

        const subtitle =
          cleanText(
            subtitleElement?.textContent
          );

        const description =
          cleanText(
            card.querySelector(
              "p"
            )?.textContent
          );

        const descriptionElement =
          card.querySelector(
            "p"
          ) as HTMLElement | null;

        const eyebrowElement =
          card.querySelector(
            ":scope > .tag, :scope > .r-num, :scope > .eyebrow, :scope > .section-tag, :scope > .badge, :scope > .pill, :scope > [class*='eyebrow'], :scope > [class*='badge'], :scope > [class*='pill']"
          ) as HTMLElement | null;

        const tagElements =
          getTagElements(
            card
          );

        if (
          !title
        ) {
          return null;
        }

        return {
          id:
            `pillar-${index}`,

          title,

          description:
            [
              subtitle,
              description
            ]
              .filter(Boolean)
              .join("\n"),

          styles: {
            card:
              mergeElementStyles(
                card
              ),
            eyebrow:
              mergeElementStyles(
                eyebrowElement
              ),
            title:
              mergeElementStyles(
                heading as HTMLElement | null
              ),
            description:
              mergeElementStyles(
                descriptionElement
              ),
            tags:
              tagElements
                .map(
                  mergeElementStyles
                )
                .filter(Boolean)
          }
        };
      }
    )
    .filter(
      (
        item
      ): item is any =>
        item !== null
    );
};

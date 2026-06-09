import type {
  TrustLogoSectionPayload
} from "../../semanticContracts/TrustLogoSectionPayload";
import type {
  StructuralNode
} from "../../structure/buildStructuralGraph";
import {
  getElementClassName
} from "../../domGuards";

const normalizeText = (
  value: string | null | undefined
) =>
  (value || "")
    .replace(/\s+/g, " ")
    .trim();

const isHTMLElementLike = (
  element: Element
): element is HTMLElement =>
  element.nodeType === 1 &&
  typeof (element as HTMLElement).tagName === "string";

const hasTrustHeadingText = (
  element: HTMLElement
) => {
  const headingText =
    normalizeText(
      Array.from(
        element.querySelectorAll(
          "h1,h2,h3"
        )
      )
        .map(heading => heading.textContent || "")
        .join(" ")
    ).toLowerCase();

  return [
    "ils nous font confiance",
    "trusted by",
    "they trust us",
    "our clients",
    "nos clients",
    "references",
    "références",
    "partners",
    "partenaires",
    "institutions"
  ].some(token =>
    headingText.includes(token)
  );
};

const findLogoContainer = (
  section: HTMLElement
) =>
  section.querySelector(
    ".partners-row, .partners, .logos, .logo-cloud, .clients, .references"
  ) as HTMLElement | null;

const getDirectLogoItems = (
  container: HTMLElement | null
) =>
  !container
    ? []
    : Array.from(
        container.children
      ).filter((child): child is HTMLElement => {
        if (!isHTMLElementLike(child)) {
          return false;
        }

        const text =
          normalizeText(
            child.textContent
          );

        return (
          text.length > 0 &&
          text.length <= 80
        );
      });

const extractEyebrow = (
  section: HTMLElement
) =>
  normalizeText(
    (
      section.querySelector(
        ".section-tag, .eyebrow, [class*='eyebrow'], [class*='tag']"
      ) as HTMLElement | null
    )?.textContent
  );

const extractTitle = (
  section: HTMLElement
) =>
  normalizeText(
    (
      section.querySelector(
        "h1,h2,h3"
      ) as HTMLElement | null
    )?.textContent
  );

const extractDescription = (
  section: HTMLElement
) =>
  normalizeText(
    (
      section.querySelector(
        "p"
      ) as HTMLElement | null
    )?.textContent
  );

export const resolveTrustLogoSection = (
  node: StructuralNode
): TrustLogoSectionPayload | null => {
  const element =
    node.element;

  if (
    element.tagName !== "SECTION"
  ) {
    return null;
  }

  const logoContainer =
    findLogoContainer(
      element
    );

  const logoItems =
    getDirectLogoItems(
      logoContainer
    );

  const hasHeading =
    hasTrustHeadingText(
      element
    );

  const matches =
    hasHeading &&
    !!logoContainer &&
    logoItems.length >= 4;

  console.log(
    "TRUST_LOGO_CHECK",
    {
      tag:
        element.tagName,
      className:
        getElementClassName(
          element
        ),
      hasHeading,
      logoContainerClassName:
        logoContainer
          ? getElementClassName(
              logoContainer
            )
          : "",
      directLogoItemCount:
        logoItems.length,
      matches
    }
  );

  if (!matches) {
    return null;
  }

  return {
    type:
      "TRUST_LOGO_SECTION",
    confidence:
      0.92,
    reason: [
      "section-boundary",
      "trust-heading",
      "direct-logo-items"
    ],
    eyebrow:
      extractEyebrow(
        element
      ),
    title:
      extractTitle(
        element
      ),
    description:
      extractDescription(
        element
      ),
    items:
      logoItems.map((item, index) => ({
        id:
          `trust-logo-${index}`,
        label:
          normalizeText(
            item.textContent
          )
      })),
    claimedNode:
      node,
    sourceNode:
      logoContainer || undefined
  };
};

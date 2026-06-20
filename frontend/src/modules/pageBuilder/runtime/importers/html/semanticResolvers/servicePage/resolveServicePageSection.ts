import type {
  StructuralNode
} from "../../structure/buildStructuralGraph";
import type {
  ServicePageSectionPayload,
  ServicePageSectionVariant
} from "../semanticContracts/ServicePageSectionPayload";
import {
  getElementClassName
} from "../../domGuards";

const REQUIRED_SELECTORS = [
  ".svc-grid",
  ".deliverables",
  ".markets",
  ".cta-svc",
  ".sec-head",
  ".other-svc"
] as const;

const getComputed = (
  element: HTMLElement
) =>
  element.ownerDocument
    .defaultView
    ?.getComputedStyle(
      element
    );

const findServiceContainer = (
  element: HTMLElement
) => {
  let current:
    HTMLElement | null =
    element;

  while (current) {
    if (
      REQUIRED_SELECTORS.every(
        selector =>
          current?.querySelector(
            selector
          )
      )
    ) {
      return current;
    }

    current =
      current.parentElement;
  }

  return null;
};

const getVariant = (
  element: HTMLElement
): ServicePageSectionVariant | null => {
  if (
    element.matches(
      ".svc-grid"
    )
  ) {
    return "SERVICE_INTRO_GRID";
  }

  if (
    element.matches(
      ".deliverables"
    )
  ) {
    return "SERVICE_DELIVERABLES";
  }

  if (
    element.matches(
      ".markets"
    )
  ) {
    return "SERVICE_MARKETS";
  }

  if (
    element.matches(
      ".cta-svc"
    )
  ) {
    return "SERVICE_CTA";
  }

  if (
    element.matches(
      ".sec-head"
    )
  ) {
    return "SERVICE_HEADING";
  }

  if (
    element.matches(
      ".other-svc"
    )
  ) {
    return "SERVICE_CARDS";
  }

  return null;
};

const validateVariantStructure = (
  element: HTMLElement,
  variant: ServicePageSectionVariant
) => {
  const computed =
    getComputed(
      element
    );

  switch (variant) {
    case "SERVICE_INTRO_GRID":
      return (
        element.querySelectorAll(
          ":scope > .svc-block"
        ).length >= 2 &&
        (
          computed?.display ===
            "grid" ||
          computed?.display ===
            "flex"
        )
      );

    case "SERVICE_DELIVERABLES":
      return (
        !!element.querySelector(
          "h2,h3"
        ) &&
        element.querySelectorAll(
          "li"
        ).length >= 2
      );

    case "SERVICE_MARKETS":
      return (
        !!element.querySelector(
          "a,button"
        ) &&
        element.children.length >= 2 &&
        (
          computed?.display ===
            "flex" ||
          computed?.display ===
            "grid"
        )
      );

    case "SERVICE_CTA":
      return (
        !!element.querySelector(
          "h2,h3"
        ) &&
        element.querySelectorAll(
          "a,button"
        ).length >= 2
      );

    case "SERVICE_HEADING":
      return !!element.querySelector(
        "h1,h2,h3"
      );

    case "SERVICE_CARDS":
      return (
        element.querySelectorAll(
          ":scope > a, :scope > article, :scope > .s-card"
        ).length >= 3 &&
        (
          computed?.display ===
            "grid" ||
          computed?.display ===
            "flex"
        )
      );
  }
};

export const resolveServicePageSection = (
  node: StructuralNode
): ServicePageSectionPayload | null => {
  const element =
    node.element;
  const variant =
    getVariant(
      element
    );
  const serviceContainer =
    findServiceContainer(
      element
    );

  if (
    variant ||
    serviceContainer
  ) {
    console.log(
      "SERVICE_PAGE_CHECK",
      {
        tag:
          element.tagName,
        className:
          getElementClassName(
            element
          ),
        variant,
        hasServiceContainer:
          !!serviceContainer,
        requiredRegions:
          serviceContainer
            ? REQUIRED_SELECTORS.map(
                selector => ({
                  selector,
                  found:
                    !!serviceContainer.querySelector(
                      selector
                    )
                })
              )
            : []
      }
    );
  }

  if (
    !variant ||
    !serviceContainer ||
    !validateVariantStructure(
      element,
      variant
    )
  ) {
    return null;
  }

  console.log(
    "SERVICE_PAGE_MATCH",
    {
      variant,
      tag:
        element.tagName,
      className:
        getElementClassName(
          element
        ),
      display:
        getComputed(
          element
        )?.display
    }
  );

  return {
    type:
      "SERVICE_PAGE_SECTION",
    variant,
    claimedNode:
      node
  };
};

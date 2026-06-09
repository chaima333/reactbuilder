import type {
  CtaSectionPayload
} from "../../semanticContracts/CtaSectionPayload";
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

const hasCtaIdentity = (
  element: HTMLElement
) => {
  const identity =
    `${element.id || ""} ${getElementClassName(element)}`
      .toLowerCase();

  return (
    identity.includes("cta") ||
    identity.includes("call-to-action") ||
    identity.includes("final")
  );
};

const isHTMLElementLike = (
  element: Element
): element is HTMLElement =>
  element.nodeType === 1 &&
  typeof (element as HTMLElement).tagName === "string";

const belongsToCurrentSectionOwner = (
  owner: HTMLElement,
  descendant: HTMLElement
) => {
  const nearestSectionOwner =
    descendant.closest(
      "section, main"
    );

  return (
    !nearestSectionOwner ||
    nearestSectionOwner === owner
  );
};

const findStructuralNodeByElement = (
  node: StructuralNode,
  element: HTMLElement
): StructuralNode | null => {
  if (node.element === element) {
    return node;
  }

  for (const child of node.children) {
    const found =
      findStructuralNodeByElement(
        child,
        element
      );

    if (found) {
      return found;
    }
  }

  return null;
};

const findLocalCtaElement = (
  element: HTMLElement
) => {
  if (hasCtaIdentity(element)) {
    return element;
  }

  const candidate =
    Array.from(
      element.querySelectorAll(
        "[id*='cta' i], [class*='cta' i], [id*='call-to-action' i], [class*='call-to-action' i], [id*='final' i], [class*='final' i]"
      )
    ).find(
      candidate =>
        isHTMLElementLike(candidate) &&
        belongsToCurrentSectionOwner(
          element,
          candidate
        )
    );

  return candidate || null;
};

const extractActions = (
  element: HTMLElement
) =>
  Array.from(
    element.querySelectorAll(
      "a,button"
    )
  ).map(
    (action, index) => ({
      id:
        `cta-section-action-${index}`,
      label:
        normalizeText(
          action.textContent
        ),
      href:
        action.getAttribute("href") || "",
      tag:
        action.tagName.toLowerCase()
    })
  ).filter(
    action =>
      !!action.label
  );

export const resolveCtaSection = (
  node: StructuralNode
): CtaSectionPayload | null => {
  const element =
    node.element;

  const ctaElement =
    findLocalCtaElement(
      element
    );

  if (!ctaElement) {
    return null;
  }

  const titleEl =
    ctaElement.querySelector(
      "h1,h2"
    );

  const textEl =
    ctaElement.querySelector(
      "p"
    );

  const actions =
    extractActions(
      ctaElement
    );

  const title =
    normalizeText(
      titleEl?.textContent
    );

  const matches =
    !!title &&
    actions.length >= 1;

  console.log(
    "CTA CHECK",
    {
      id:
        element.id,
      className:
        getElementClassName(
          element
        ),
      ctaClassName:
        getElementClassName(
          ctaElement
        ),
      hasTitle:
        !!title,
      hasText:
        !!normalizeText(
          textEl?.textContent
        ),
      actionCount:
        actions.length,
      matches
    }
  );

  if (!matches) {
    return null;
  }

  const claimedElement =
    ctaElement.tagName === "SECTION"
      ? ctaElement
      : ctaElement.closest("section") || ctaElement;

  const claimedNode =
    findStructuralNodeByElement(
      node,
      claimedElement as HTMLElement
    );

  const payload = {
    type: "CTA_SECTION",
    confidence: 0.9,
    reason: [
      "cta-identity",
      "title",
      "action"
    ],
    title,
    text:
      normalizeText(
        textEl?.textContent
      ),
    actions,
    claimedNode:
      claimedNode || node
  };

  console.log(
    "CTA_PAYLOAD",
    payload
  );

  return payload;
};

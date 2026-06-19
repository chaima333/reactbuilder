import type {
  CtaSectionPayload
} from "../../semanticContracts/CtaSectionPayload";
import type {
  StructuralNode
} from "../../structure/buildStructuralGraph";
import {
  getElementClassName
} from "../../domGuards";
import {
  extractTitleSegments
} from "../../typography/extractTitleSegments";

const normalizeText = (
  value: string | null | undefined
) =>
  (value || "")
    .replace(/\s+/g, " ")
    .trim();

const forbiddenCtaRootTags =
  new Set([
    "BODY",
    "HTML"
  ]);

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
  if (
    forbiddenCtaRootTags.has(
      owner.tagName
    )
  ) {
    return true;
  }

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

const getComputed = (
  element: HTMLElement
) =>
  (
    element.ownerDocument.defaultView ||
    window
  ).getComputedStyle(
    element
  );

const getElementStyleSnapshot = (
  element: HTMLElement | null
) => {
  if (!element) {
    return null;
  }

  const computed =
    getComputed(
      element
    );

  return {
    tag:
      element.tagName,
    className:
      getElementClassName(
        element
      ),
    id:
      element.id || "",
    background:
      computed.background,
    backgroundColor:
      computed.backgroundColor,
    backgroundImage:
      computed.backgroundImage,
    color:
      computed.color,
    padding:
      computed.padding,
    margin:
      computed.margin,
    border:
      computed.border,
    borderRadius:
      computed.borderRadius,
    width:
      computed.width,
    maxWidth:
      computed.maxWidth,
    display:
      computed.display,
    flexDirection:
      computed.flexDirection,
    alignItems:
      computed.alignItems,
    justifyContent:
      computed.justifyContent,
    gap:
      computed.gap
  };
};

const findCtaSectionElement = (
  owner: HTMLElement,
  panel: HTMLElement
) => {
  let current: HTMLElement | null =
    panel.parentElement;
  let best: HTMLElement =
    owner;

  while (current) {
    if (
      forbiddenCtaRootTags.has(
        current.tagName
      )
    ) {
      break;
    }

    const computed =
      getComputed(
        current
      );
    const background =
      `${computed.backgroundColor} ${computed.backgroundImage}`
        .replace(/\s+/g, "")
        .toLowerCase();
    const hasRealBackground =
      ![
        "rgba(0,0,0,0)none",
        "transparentnone",
        "none"
      ].includes(
        background
      );
    const isSectionLike =
      /^(SECTION|MAIN|ARTICLE)$/i.test(
        current.tagName
      );

    if (
      isSectionLike ||
      hasRealBackground
    ) {
      best =
        current;
    }

    if (current === owner) {
      break;
    }

    current =
      current.parentElement;
  }

  return best;
};

const findCtaContainerElement = (
  panel: HTMLElement,
  section: HTMLElement
) => {
  let current =
    panel.parentElement;

  let best: HTMLElement | null =
    null;

  while (
    current &&
    current !== section
  ) {
    if (
      forbiddenCtaRootTags.has(
        current.tagName
      )
    ) {
      break;
    }

    const className =
      getElementClassName(
        current
      ).toLowerCase();
    const computed =
      getComputed(
        current
      );
    const maxWidth =
      parseFloat(
        computed.maxWidth
      );
    const width =
      parseFloat(
        computed.width
      );
    const hasContainerName =
      /container|wrapper|wrap|inner/.test(
        className
      );
    const hasConstrainedWidth =
      Number.isFinite(maxWidth) &&
      maxWidth > 0 &&
      maxWidth < 1800;
    const hasCenteredMargins =
      computed.marginLeft === "auto" ||
      computed.marginRight === "auto";
    const isNarrowerThanViewport =
      Number.isFinite(width) &&
      width > 0 &&
      width < 1800;

    if (
      hasContainerName ||
      hasConstrainedWidth ||
      hasCenteredMargins ||
      isNarrowerThanViewport
    ) {
      best =
        current;
    }

    current =
      current.parentElement;
  }

  return best;
};

const findLocalCtaElement = (
  element: HTMLElement
) => {
  const candidates =
    [
      element,
      ...Array.from(
        element.querySelectorAll(
          "[id*='cta' i], [class*='cta' i], [id*='call-to-action' i], [class*='call-to-action' i], [id*='final' i], [class*='final' i]"
        )
      )
    ]
      .filter(
      candidate =>
        isHTMLElementLike(candidate) &&
        !forbiddenCtaRootTags.has(
          candidate.tagName
        ) &&
        belongsToCurrentSectionOwner(
          element,
          candidate
        )
    ) as HTMLElement[];

  const scoreCandidate = (
    candidate: HTMLElement
  ) => {
    if (
      forbiddenCtaRootTags.has(
        candidate.tagName
      )
    ) {
      return -9999;
    }

    const computed =
      (
        candidate.ownerDocument.defaultView ||
        window
      ).getComputedStyle(
        candidate
      );
    const hasTitle =
      !!candidate.querySelector(
        "h1,h2,h3,h4,h5"
      );
    const hasText =
      !!candidate.querySelector(
        "p, .lead, .subtitle"
      );
    const actionCount =
      candidate.querySelectorAll(
        "a,button"
      ).length;
    const hasVisualPanel =
      computed.borderRadius !== "0px" ||
      !computed.border.startsWith("0px") ||
      (
        computed.backgroundImage &&
        computed.backgroundImage !== "none"
      ) ||
      (
        computed.backgroundColor &&
        computed.backgroundColor !==
          "rgba(0, 0, 0, 0)"
      );
    const maxWidth =
      parseFloat(
        computed.maxWidth
      );
    const hasConstrainedWidth =
      Number.isFinite(maxWidth) &&
      maxWidth > 0 &&
      maxWidth < 1800;
    const depth =
      candidate === element
        ? 0
        : Array.from(
            element.querySelectorAll("*")
          ).indexOf(candidate) + 1;

    return (
      (hasTitle ? 20 : 0) +
      (hasText ? 8 : 0) +
      Math.min(
        actionCount,
        2
      ) * 15 +
      (hasVisualPanel ? 25 : 0) +
      (hasConstrainedWidth ? 10 : 0) +
      Math.min(depth, 20)
    );
  };

  const ranked =
    candidates
      .map(candidate => ({
        candidate,
        score:
          scoreCandidate(
            candidate
          )
      }))
      .sort(
        (a, b) =>
          b.score - a.score
      );

  console.log(
    "CTA_PANEL_CANDIDATES",
    ranked.map(entry => ({
      score:
        entry.score,
      tag:
        entry.candidate.tagName,
      className:
        getElementClassName(
          entry.candidate
        )
    }))
  );

  return ranked[0]?.candidate || null;

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

  if (
    forbiddenCtaRootTags.has(
      element.tagName
    )
  ) {
    console.log(
      "CTA_SKIP_FORBIDDEN_ROOT",
      {
        tag:
          element.tagName,
        className:
          getElementClassName(
            element
          )
      }
    );

    return null;
  }

  const ctaElement =
    findLocalCtaElement(
      element
    );

  if (!ctaElement) {
    return null;
  }

 const titleEl =
  ctaElement.querySelector(
    "h1,h2,h3,h4,h5"
  );
  console.log(
  "CTA_TITLE_ELEMENT",
  titleEl?.tagName,
  titleEl?.textContent
);

const textEl =
  ctaElement.querySelector(
    "p, .lead, .subtitle"
  );

  const actions =
    extractActions(
      ctaElement
    );
    const ctaIdentity =
  `${ctaElement.id || ""} ${getElementClassName(ctaElement)}`
    .toLowerCase();

const hasExplicitCtaIdentity =
  ctaIdentity.includes("cta") ||
  ctaIdentity.includes("call-to-action") ||
  ctaIdentity.includes("final");

if (
  ctaElement.tagName === "SECTION" &&
  !hasExplicitCtaIdentity
) {
  console.log(
    "CTA_REJECTED_GENERIC_SECTION",
    {
      title:
        normalizeText(
          titleEl?.textContent
        ),
      actions:
        actions.length,
      className:
        getElementClassName(
          ctaElement
        )
    }
  );

  return null;
}

if (
  actions.length > 3 &&
  !hasExplicitCtaIdentity
) {
  console.log(
    "CTA_REJECTED_TOO_MANY_ACTIONS",
    {
      title:
        normalizeText(
          titleEl?.textContent
        ),
      actions:
        actions.length,
      className:
        getElementClassName(
          ctaElement
        )
    }
  );

  return null;
}

  const title =
    normalizeText(
      titleEl?.textContent
    );
  const titleSegments =
    extractTitleSegments(
      titleEl as HTMLElement | null
    );

 const matches =
  actions.length >= 1 &&
  (
    !!title ||
    !!normalizeText(textEl?.textContent)
  );

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
    ctaElement as HTMLElement;
  const sectionElement =
    findCtaSectionElement(
      element,
      claimedElement
    );
  const containerElement =
    findCtaContainerElement(
      claimedElement,
      sectionElement
    );

  const claimedNode =
    findStructuralNodeByElement(
      node,
      claimedElement as HTMLElement
    );

const payload: CtaSectionPayload = {
      type: "CTA_SECTION",
    confidence: 0.9,
    reason: [
      "cta-identity",
      "title",
      "action"
    ],
    title,
    titleSegments,
    text:
      normalizeText(
        textEl?.textContent
      ),
    actions,
    claimedNode:
      claimedNode || node,
    sectionElement,
    containerElement:
      containerElement || undefined,
    panelElement:
      claimedElement
  };

  console.log(
    "CTA_SELECTED_PANEL_STYLE",
    getElementStyleSnapshot(
      claimedElement
    )
  );

  console.log(
    "CTA_SECTION_STYLE",
    getElementStyleSnapshot(
      sectionElement
    )
  );

  console.log(
    "CTA_CONTAINER_STYLE",
    getElementStyleSnapshot(
      containerElement
    )
  );

  console.log(
    "CTA_PAYLOAD",
    payload
  );
console.log(
  "CTA_CLAIMED_NODE",
  {
    title,
    tag:
      claimedNode?.element?.tagName,
    className:
      claimedNode?.element?.className
  }
);
  return payload;
};

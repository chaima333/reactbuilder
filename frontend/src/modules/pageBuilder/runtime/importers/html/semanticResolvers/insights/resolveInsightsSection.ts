import type {
  InsightsSectionPayload
} from "../../semanticContracts/InsightsSectionPayload";
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

const hasInsightsIdentity = (
  element: HTMLElement
) => {
  const identity =
    `${element.id || ""} ${getElementClassName(element)}`
      .toLowerCase();

  return [
    "insights",
    "articles",
    "blog",
    "news",
    "research"
  ].some(
    token =>
      identity.includes(
        token
      )
  );
};

const isHTMLElementLike = (
  element: Element
): element is HTMLElement =>
  element.nodeType === 1 &&
  typeof (element as HTMLElement).tagName === "string";

const getShortLogoLikeItems = (
  element: HTMLElement
) => {
  const logoContainer =
    element.querySelector(
      ".partners-row, .partners, .logos, .logo-cloud, .clients, .references"
    ) as HTMLElement | null;

  if (!logoContainer) {
    return [];
  }

  return Array.from(
    logoContainer.children
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
};

const isTrustLikeSection = (
  element: HTMLElement
) => {
  const identity =
    `${element.id || ""} ${getElementClassName(element)}`.toLowerCase();

  const text =
    normalizeText(
      element.textContent
    ).toLowerCase();

  const hasTrustText =
    [
      "ils nous font confiance",
      "trusted by",
      "they trust us",
      "our clients",
      "nos clients",
      "references",
      "références",
      "partners",
      "partenaires"
    ].some(token =>
      text.includes(token)
    );

  const hasTrustClass =
    [
      "partners",
      "logos",
      "clients",
      "references",
      "trust"
    ].some(token =>
      identity.includes(token) ||
      !!element.querySelector(
        `.${token}, [class*='${token}']`
      )
    );

  return (
    (hasTrustText || hasTrustClass) &&
    getShortLogoLikeItems(element).length >= 4
  );
};

const getLocalInsightsGrid = (
  element: HTMLElement
) => {
  const grid =
    (
      element.matches(
        ".insights-grid, [class*='insights-grid']"
      )
        ? element
        : element.querySelector(
            ".insights-grid, [class*='insights-grid']"
          )
    ) as HTMLElement | null;

  if (!grid) {
    return null;
  }

  const nearestSectionOwner =
    grid.closest(
      "section, main"
    );

  if (
    nearestSectionOwner &&
    nearestSectionOwner !== element
  ) {
    return null;
  }

  return grid;
};

const belongsToCurrentSemanticOwner = (
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

const getLocalInsightArticles = (
  element: HTMLElement
) =>
  Array.from(
    element.querySelectorAll(
      "article.insight, article[class*='insight']"
    )
  ).filter(
    (candidate): candidate is HTMLElement =>
      isHTMLElementLike(candidate) &&
      belongsToCurrentSemanticOwner(
        element,
        candidate
      )
  );

const getInsightCardElements = (
  element: HTMLElement,
  localGrid: HTMLElement | null
) => {
  const explicitCards =
    Array.from(
      element.querySelectorAll(
        "article.insight, article[class*='insight'], .insight-card, .article-card, .blog-card, .news-card"
      )
    ).filter(
      (candidate): candidate is HTMLElement =>
        isHTMLElementLike(candidate) &&
        candidate !== element &&
        (
          localGrid?.contains(candidate) ||
          belongsToCurrentSemanticOwner(
            element,
            candidate
          )
        )
    );

  if (explicitCards.length >= 2) {
    return explicitCards;
  }

  const scope =
    localGrid || element;

  return Array.from(
    scope.children
  ).filter(
    (child): child is HTMLElement => {
      if (!isHTMLElementLike(child)) {
        return false;
      }

      const hasTitle =
        !!child.querySelector(
          "h2,h3,h4"
        );

      const hasText =
        !!child.querySelector(
          "p"
        );

      return hasTitle && hasText;
    }
  );
};

const extractSectionTitle = (
  element: HTMLElement,
  cards: HTMLElement[]
) => {
  const cardSet =
    new Set<HTMLElement>(
      cards
    );

  const heading =
    Array.from(
      element.querySelectorAll(
        "h1,h2"
      )
    ).find(
      candidate =>
        !cards.some(
          card =>
            card.contains(
              candidate
            )
        ) &&
        !cardSet.has(
          candidate as HTMLElement
        )
    );

  return normalizeText(
    heading?.textContent
  );
};

const isInsideAny = (
  element: Element,
  containers: HTMLElement[]
) =>
  containers.some(
    container =>
      container.contains(
        element
      )
  );

const extractSectionDescription = (
  element: HTMLElement,
  cards: HTMLElement[]
) => {
  const paragraph =
    Array.from(
      element.querySelectorAll(
        "p"
      )
    ).find(
      candidate =>
        !isInsideAny(
          candidate,
          cards
        )
    );

  return normalizeText(
    paragraph?.textContent
  );
};

const extractSectionActions = (
  element: HTMLElement,
  cards: HTMLElement[],
  localGrid: HTMLElement | null
) =>
  Array.from(
    element.querySelectorAll(
      "a,button"
    )
  )
    .filter(
      (candidate): candidate is HTMLElement =>
        isHTMLElementLike(
          candidate
        ) &&
        !isInsideAny(
          candidate,
          cards
        ) &&
        !localGrid?.contains(
          candidate
        ) &&
        belongsToCurrentSemanticOwner(
          element,
          candidate
        )
    )
    .map(
      action => ({
        label:
          normalizeText(
            action.textContent
          ),
        href:
          action.getAttribute(
            "href"
          ) || ""
      })
    )
    .filter(
      action =>
        !!action.label
    );

const extractInsightItem = (
  card: HTMLElement,
  index: number
) => {
  const titleEl =
    card.querySelector(
      "h2,h3,h4"
    );

  const descriptionEl =
    card.querySelector(
      "p"
    );

  const metaEl =
    card.querySelector(
      ".meta, time, [class*='meta'], [class*='date'], [class*='category']"
    );

  const actionEl =
    card.querySelector(
      "a,button"
    ) as HTMLAnchorElement | HTMLButtonElement | null;

  const title =
    normalizeText(
      titleEl?.textContent
    );

  if (!title) {
    return null;
  }

  return {
    title,
    description:
      normalizeText(
        descriptionEl?.textContent
      ),
    meta:
      normalizeText(
        metaEl?.textContent
      ),
    href:
      actionEl?.getAttribute("href") || "",
    ctaLabel:
      normalizeText(
        actionEl?.textContent
      ) ||
      `Read insight ${index + 1}`
  };
};

export const resolveInsightsSection = (
  node: StructuralNode
): InsightsSectionPayload | null => {
  const element =
    node.element;

  if (
    isTrustLikeSection(
      element
    )
  ) {
    console.log(
      "INSIGHTS REJECT TRUST COLLISION",
      {
        tag:
          element.tagName,
        className:
          getElementClassName(
            element
          ),
        logoLikeCount:
          getShortLogoLikeItems(
            element
          ).length
      }
    );

    return null;
  }

  const localGrid =
    getLocalInsightsGrid(
      element
    );

  const localInsightArticles =
    getLocalInsightArticles(
      element
    );

  const hasGrid =
    !!localGrid;

  const hasInsightArticle =
    localInsightArticles.length > 0;

  const cards =
    getInsightCardElements(
      element,
      localGrid
    );

  const hasRepeatedCardShape =
    cards.length >= 2;

  const hasCandidateSignal =
    node.candidates.some(
      candidate =>
        candidate.type === "GRID" ||
        candidate.type === "REPEATED_PATTERN" ||
        candidate.metadata?.repeated === true ||
        candidate.metadata?.layoutMode === "GRID" ||
        candidate.metadata?.layoutMode === "REPEAT"
    );

  const matches =
    (
      hasInsightsIdentity(element) ||
      hasGrid ||
      hasInsightArticle
    ) &&
    hasRepeatedCardShape &&
    (
      hasGrid ||
      hasInsightArticle ||
      hasCandidateSignal
    );

  console.log(
    "INSIGHTS CHECK",
    {
      id:
        element.id,
      className:
        getElementClassName(
          element
        ),
      hasGrid,
      localGridClassName:
        localGrid
          ? getElementClassName(
              localGrid
            )
          : "",
      hasInsightArticle,
      cardCount:
        cards.length,
      hasCandidateSignal,
      matches
    }
  );

  if (!matches) {
    return null;
  }

  const items =
    cards
      .map(extractInsightItem)
      .filter(
        (item): item is NonNullable<typeof item> =>
          item !== null
      );

  if (items.length < 2) {
    return null;
  }

  const description =
    extractSectionDescription(
      element,
      cards
    );

  const actions =
    extractSectionActions(
      element,
      cards,
      localGrid
    );

  const payload = {
    type: "INSIGHTS_SECTION",
    confidence: 0.9,
    reason: [
      "insights-identity",
      hasGrid ? "insights-grid" : "",
      hasInsightArticle ? "article-insight" : "",
      "repeated-card-shape"
    ].filter(Boolean),
    title:
      extractSectionTitle(
        element,
        cards
      ),
    description,
    items,
    actions,
    claimedNode:
      node
  };

  console.log(
    "INSIGHTS_PAYLOAD",
    JSON.stringify(
      {
        title:
          payload.title,
        description:
          payload.description,
        itemsCount:
          payload.items.length,
        actionsCount:
          payload.actions.length,
        actions:
          payload.actions
      },
      null,
      2
    )
  );

  return payload;
};

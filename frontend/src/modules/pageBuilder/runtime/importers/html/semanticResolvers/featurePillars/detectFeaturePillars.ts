import type {
  StructuralNode
} from "../../structure/buildStructuralGraph";

import {
  getElementClassName
} from "../../domGuards";

const hasClassToken = (
  element: HTMLElement,
  token: string
) =>
  element.classList.contains(
    token
  );

const isAroundPillars = (
  node: StructuralNode
) => {
  const element =
    node.element;

  return (
    hasClassToken(
      element,
      "pillars"
    ) ||
    !!element.querySelector(
      ".pillars"
    ) ||
    !!element.closest(
      ".pillars"
    )
  );
};

const getComputedDisplayMode = (
  element: HTMLElement
) => {
  const view =
    element.ownerDocument.defaultView;

  const computed =
    view?.getComputedStyle(
      element
    );

  return {
    display:
      computed?.display || "",
    gridTemplateColumns:
      computed?.gridTemplateColumns || "",
    flexDirection:
      computed?.flexDirection || ""
  };
};

const getDetectionFacts = (
  node: StructuralNode
) => {
  const element =
    node.element;

  const children =
    Array.from(
      element.children
    );

  const repeatedCandidate =
    node.candidates.some(
      candidate =>
        candidate.type ===
          "REPEATED_PATTERN" ||
        candidate.metadata?.layoutMode ===
          "REPEAT"
    );

  const articleCount =
    element.querySelectorAll(
      "article"
    ).length;

  const directArticleCount =
    children.filter(
      child =>
        child.tagName.toLowerCase() ===
        "article"
    ).length;

  const h3Count =
    element.querySelectorAll(
      "h3"
    ).length;

  const pCount =
    element.querySelectorAll(
      "p"
    ).length;

  const tagsCount =
    element.querySelectorAll(
      ".tags, .tag, .chip, .pill"
    ).length;

  const cardCount =
    children.filter(child => {
      const hasTitle =
        !!child.querySelector(
          "h1,h2,h3,h4,h5,h6"
        );

      const hasText =
        !!child.querySelector(
          "p"
        );

      return (
        hasTitle &&
        hasText
      );
    }).length;

  const reasons: string[] = [];

  if (!repeatedCandidate) {
    reasons.push(
      "missing REPEATED_PATTERN candidate on node"
    );
  }

  if (children.length < 3) {
    reasons.push(
      "node has fewer than 3 direct children"
    );
  }

  if (cardCount < 3) {
    reasons.push(
      "node has fewer than 3 direct card-like children"
    );
  }

  if (!reasons.length) {
    reasons.push(
      "accepted"
    );
  }

  return {
    repeatedCandidate,
    children,
    articleCount,
    directArticleCount,
    h3Count,
    pCount,
    tagsCount,
    cardCount,
    reasons
  };
};

export const detectFeaturePillars = (
  node: StructuralNode
): boolean => {
  const facts =
    getDetectionFacts(
      node
    );

  if (
    isAroundPillars(
      node
    )
  ) {
    console.log(
      "FEATURE_PILLARS_DETECT_REPORT",
      JSON.stringify(
        {
          node: {
            tag:
              node.element.tagName,
            className:
              getElementClassName(
                node.element
              ),
            path:
              node.path
          },
          hasPillarsClass:
            hasClassToken(
              node.element,
              "pillars"
            ),
          articleCount:
            facts.articleCount,
          directArticleCount:
            facts.directArticleCount,
          h3Count:
            facts.h3Count,
          pCount:
            facts.pCount,
          tagsCount:
            facts.tagsCount,
          computed:
            getComputedDisplayMode(
              node.element
            ),
          candidates:
            node.candidates.map(
              candidate => ({
                type:
                  candidate.type,
                semanticIntent:
                  candidate.semanticIntent,
                score:
                  candidate.score,
                layoutMode:
                  candidate.metadata?.layoutMode,
                metadata:
                  candidate.metadata
              })
            ),
          reason:
            facts.reasons.join(
              "; "
            )
        },
        null,
        2
      )
    );
  }

  console.log(
    "FEATURE CHECK",
    {
      className:
        getElementClassName(
          node.element
        ),
      candidates:
        node.candidates.map(
          c => c.type
        )
    }
  );

  console.log(
    "FEATURE REPEATED",
    facts.repeatedCandidate
  );

  const explicitPillars =
    hasClassToken(
      node.element,
      "pillars"
    );

  const directPillarsChild =
    facts.children.find(
      child =>
        hasClassToken(
          child as HTMLElement,
          "pillars"
        )
    );

  if (
    directPillarsChild &&
    !explicitPillars
  ) {
    console.log(
      "FEATURE_PILLARS_PARENT_SKIPPED_FOR_DIRECT_CHILD",
      {
        parent:
          getElementClassName(
            node.element
          ),
        child:
          getElementClassName(
            directPillarsChild as HTMLElement
          )
      }
    );

    return false;
  }

  if (
    explicitPillars &&
    facts.cardCount >= 3
  ) {
    console.log(
      "FEATURE_ACCEPT_EXPLICIT_PILLARS",
      {
        className:
          getElementClassName(
            node.element
          ),
        path:
          node.path,
        cardCount:
          facts.cardCount,
        repeatedCandidate:
          facts.repeatedCandidate
      }
    );

    return true;
  }

  if (!facts.repeatedCandidate) {
    console.log(
      "FEATURE FAIL: NO REPEATED CANDIDATE"
    );

    return false;
  }

  const className =
    getElementClassName(
      node.element
    ).toLowerCase();

  console.log(
    "FEATURE CLASSNAME",
    className
  );

  console.log(
    "FEATURE STRUCTURE",
    {
      root:
        getElementClassName(
          node.element
        ),
      children:
        facts.children.map(
          child => ({
            className:
              getElementClassName(
                child as HTMLElement
              ),
            title:
              !!child.querySelector(
                "h1,h2,h3,h4,h5,h6"
              ),
            text:
              !!child.querySelector(
                "p"
              ),
            links:
              child.querySelectorAll(
                "a"
              ).length
          })
        )
    }
  );

  console.log(
    "FEATURE CHILDREN",
    facts.children.length
  );

  if (
    facts.children.length < 3
  ) {
    console.log(
      "FEATURE FAIL: NOT ENOUGH CHILDREN"
    );

    return false;
  }

  facts.children.forEach(child => {
    const hasTitle =
      !!child.querySelector(
        "h1,h2,h3,h4,h5,h6"
      );

    const hasText =
      !!child.querySelector(
        "p"
      );

    console.log(
      "FEATURE CARD",
      {
        className:
          getElementClassName(
            child as HTMLElement
          ),
        hasTitle,
        hasText
      }
    );
  });

  console.log(
    "FEATURE CARD COUNT",
    facts.cardCount
  );

  const result =
    facts.cardCount >= 3;

  console.log(
    "FEATURE RESULT",
    result
  );

  return result;
};

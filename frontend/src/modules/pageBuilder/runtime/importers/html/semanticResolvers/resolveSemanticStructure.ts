import type {
  StructuralNode
} from "../structure/buildStructuralGraph";

import {
  claimSubtree
} from "../semantic/utils/claimSubtree";

import {
  semanticResolverRegistry
} from "./registry/semanticResolverRegistry";
import {
  getElementClassName,
  shouldSkipImportedElement
} from "../domGuards";



export const resolveSemanticStructure = (
  node: StructuralNode
): any[] => {

  if (
    shouldSkipImportedElement(
      node.element
    )
  ) {

    return [];
  }
// =====================================
// DEBUG SERVICE PAGE
// =====================================

  const className =
  getElementClassName(
    node.element
  );

const servicePageCheck = {
  hasSvcGrid:
    !!node.element.querySelector?.(".svc-grid") ||
    className.includes("svc-grid"),

  svcBlockCount:
    node.element.querySelectorAll?.(".svc-block").length || 0,

  hasDeliverables:
    !!node.element.querySelector?.(".deliverables") ||
    className.includes("deliverables"),

  deliverableCount:
    node.element.querySelectorAll?.(".deliverables li").length || 0,

  hasMarkets:
    !!node.element.querySelector?.(".markets") ||
    className.includes("markets"),

  hasCtaSvc:
    !!node.element.querySelector?.(".cta-svc") ||
    className.includes("cta-svc"),

  otherServiceCount:
    node.element.querySelectorAll?.(".other-svc .s-card").length || 0
};

const matches =
  servicePageCheck.hasSvcGrid &&
  servicePageCheck.hasDeliverables &&
  servicePageCheck.hasCtaSvc;

if (
  matches &&
  node.element.tagName === "BODY"
) {
  console.log(
    "SERVICE_PAGE_CHECK",
    {
      ...servicePageCheck,
      matches,
      nodeClassName:
        className,
      tag:
        node.element.tagName
    }
  );
}

// =====================================

console.log(
  "🌲 WALK",
  getElementClassName(
    node.element
  ),
  node.candidates.map(
    c => c.type
  ),
  "claimed:",
  node.claimed
);

  const semanticResults: any[] = [];

  // =====================================
  // SKIP CLAIMED NODE
  // =====================================

  if (
    node.claimed
  ) {

    return [];
  }

  // =====================================
  // CURRENT NODE
  // =====================================
for (const resolver of semanticResolverRegistry) {

  const result = resolver(node);

  if (result) {

    console.log(
      "🧠 MATCHED BY",
      resolver.name,
      result.type
    );
     console.log(
      "🚨 CLAIM BEFORE",
      result.claimedNode
    );


    claimSubtree(
      result.claimedNode || node
    );

    semanticResults.push(
      result
    );

    break;
  }
}


  // =====================================
  // CHILDREN RECURSION
  // =====================================

  for (
    const child of node.children
  ) {

    // =====================================
    // SKIP CLAIMED CHILD
    // =====================================

    if (
      child.claimed
    ) {

      continue;
    }

    const childResults =

      resolveSemanticStructure(
        child
      );

    semanticResults.push(
      ...childResults
    );
  }

  // =====================================
  // RETURN
  // =====================================
console.log(
  "🚨 SEMANTIC RESULTS RETURN",
  semanticResults.map(
    result => ({
      type: result.type,
      claimed:
        !!result.claimedNode,
      className:
        getElementClassName(
          result.claimedNode?.element
        )
    })
  )
);
  return semanticResults;
};

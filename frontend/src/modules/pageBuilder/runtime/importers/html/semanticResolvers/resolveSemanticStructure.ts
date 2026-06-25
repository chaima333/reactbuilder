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
  node: StructuralNode,
  context: {
    layout?: "page" | "navbar" | "footer";
  } = {}
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
  servicePageCheck.hasMarkets &&
  servicePageCheck.hasCtaSvc &&
  servicePageCheck.otherServiceCount >= 3;

const isServicePageAggregate =
  matches &&
  node.element.tagName !==
    "BODY";

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

  const parent =
  node.element.parentElement as HTMLElement | null;

const parentClassName =
  parent
    ? getElementClassName(parent)
    : "";

const isCardLikeChild =
  parentClassName.includes("jobs") ||
  parentClassName.includes("tiers") ||
  parentClassName.includes("profiles-grid") ||
  parentClassName.includes("founder") ||
  parentClassName.includes("podcast") ||
  parentClassName.includes("other-svc") ||
  className.includes("job") ||
  className.includes("tier") ||
  className.includes("profile") ||
  className.includes("info") ||
  className.includes("founder-body");

if (isCardLikeChild) {
  return [];
}
for (const resolver of semanticResolverRegistry) {
 if (
   isServicePageAggregate
 ) {
   console.log(
     "SERVICE_PAGE_AGGREGATE_DEFERRED_TO_CHILD_RESOLVERS",
     {
       tag:
         node.element.tagName,
       className
     }
   );

   break;
 }
  const result = resolver(node);

  if (result) {
    if (
      context.layout === "footer" &&
      (
        result.type === "CTA_SECTION" ||
        result.type === "CTA_GROUP" ||
        result.type === "CTA_CARD"
      )
    ) { continue;}
(result as any).resolverName =
  resolver.name || "anonymousResolver";


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
        child,
        context
      );

    semanticResults.push(
      ...childResults
    );
  }
  return semanticResults;
};

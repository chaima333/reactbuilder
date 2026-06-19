import { detectNavbarLayout } from "../semanticResolvers/navbar/detectNavbarLayout";

import type {
  StructuralCandidate
} from "./StructuralCandidate.types";

import {
  detectFlexGroup
} from "./detectFlexGroup";

import {
  detectGridGroup
} from "./detectGridGroup";

import {
  detectRepeatedTopology
} from "./detectRepeatedTopology";
import { shouldSkipSemanticNode } from "./shouldSkipSemanticNode";
import {
  getElementClassName,
  getTagNameLower,
  shouldSkipImportedElement
} from "../domGuards";
import {
  detectFooterLayout
} from "./detectFooterLayout";

// =====================================
// SKIP TAGS
// =====================================

const SKIP_TAGS = new Set([

  "HEAD",

  "META",

  "LINK",

  "STYLE",

  "SCRIPT"
]);

// =====================================
// ANALYZE STRUCTURE
// =====================================

export const analyzeStructure = (

  element: HTMLElement,

  path: (string | number)[],

  getElementId: (
    element: HTMLElement
  ) => string

): StructuralCandidate[] => {

  if (
    shouldSkipImportedElement(
      element
    )
  ) {

    return [];
  }

  // =====================================
  // SKIP NON CONTENT NODES
  // =====================================

  if (
    SKIP_TAGS.has(
      element.tagName
    )
  ) {

    return [];
  }

  const className =
    getElementClassName(
      element
    );

  // =====================================
// SKIP WEAK SEMANTIC NODES
// =====================================

if (
  shouldSkipSemanticNode(
    element
  )
) {

  return [];
}
  // =====================================
  // DEBUG
  // =====================================

  console.log(
    "🧠 ANALYZE NODE",
    {

      tag:
        element.tagName,

      className:
        className,

      path
    }
  );

  // =====================================
  // CANDIDATES
  // =====================================

  const candidates:
    StructuralCandidate[] = [];

  // =====================================
  // REPEATED TOPOLOGY
  // =====================================

  const repeatedCandidates =

    detectRepeatedTopology(
      element,
      path,
      getElementId
    );

  console.log(
    "🔥 REPEATED DETECTOR",
    {

      element:
        className,

      count:
        repeatedCandidates.length,

      candidates:
        repeatedCandidates
    }
  );

  candidates.push(
    ...repeatedCandidates
  );

  // =====================================
  // FLEX GROUP
  // =====================================

  const flexCandidates =

    detectFlexGroup(
      element,
      path,
      getElementId
    );

  console.log(
    "🔥 FLEX DETECTOR",
    {

      element:
        className,

      count:
        flexCandidates.length,

      candidates:
        flexCandidates
    }
  );

  candidates.push(
    ...flexCandidates
  );

  // =====================================
  // NAVBAR
  // =====================================

  const navbarCandidates =

    detectNavbarLayout(
      element,
      path,
      getElementId
    );

  console.log(
    "🔥 NAVBAR DETECTOR",
    {

      element:
        className,

      count:
        navbarCandidates.length,

      candidates:
        navbarCandidates
    }
  );

  candidates.push(
    ...navbarCandidates
  );

  const footerCandidates =
    detectFooterLayout(
      element,
      path,
      getElementId
    );

  candidates.push(
    ...footerCandidates
  );

  // =====================================
  // GRID GROUP
  // =====================================

  const gridCandidates =

    detectGridGroup(
      element,
      path,
      getElementId
    );

  console.log(
    "🔥 GRID DETECTOR",
    {

      element:
        className,

      count:
        gridCandidates.length,

      candidates:
        gridCandidates
    }
  );

  candidates.push(
    ...gridCandidates
  );
  // =====================================
  // FINAL NODE CANDIDATES
  // =====================================

  console.log(
    "🧩 NODE CANDIDATES",
    {

      element:
        `${getTagNameLower(element)}.${
          className
        }`,

      path,

      count:
        candidates.length,

      candidates
    }
  );

  // =====================================
  // RECURSION
  // =====================================
  Array.from(
    element.children
  ).forEach(
    (
      child,
      index
    ) => {

      if (
        child.nodeType === 1 &&
        typeof (child as HTMLElement).tagName === "string"
      ) {

        const childCandidates =

          analyzeStructure(
            child,
            [...path, index],
            getElementId
          );

        console.log(
          "🌲 CHILD CANDIDATES",
          {

            parent:
              className,

            child:
              getElementClassName(
                child
              ),

            count:
              childCandidates.length
          }
        );

        candidates.push(
          ...childCandidates
        );
      }
    }
  );

  // =====================================
  // FINAL RETURN
  // =====================================

  console.log(
    "✅ ANALYZE RETURN",
    {

      element:
        `${getTagNameLower(element)}.${
          className
        }`,

      totalCandidates:
        candidates.length
    }
  );


  return candidates;
};

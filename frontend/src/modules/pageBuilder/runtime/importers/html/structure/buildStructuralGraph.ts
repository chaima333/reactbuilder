import {
  StructuralCandidate
} from "../analysis/StructuralCandidate.types";
import {
  getElementClassName,
  getOwnerComputedStyle,
  shouldSkipImportedElement
} from "../domGuards";

export type StructuralNode = {

  element: HTMLElement;

  path: (string | number)[];

  computedStyle: Record<string, any>;

  candidates: StructuralCandidate[];

  children: StructuralNode[];

  parent?: StructuralNode;


  claimed?: boolean;
};

// =====================================
// DECORATIVE FILTER
// =====================================

const isDecorativeElement = (
  element: HTMLElement
) => {

  const tag =
    element.tagName;

  const hasClass = (
    classToken: string
  ) =>

    element.classList
      .contains(
        classToken
      );

  const text =
    element.textContent
      ?.trim() || "";

  const isInlineElement =

    tag === "SPAN"

    ||

    tag === "B"

    ||

    tag === "STRONG"

    ||

    tag === "EM"

    ||

    tag === "I"

    ||

    tag === "SMALL";

  // =====================================
  // EMPTY INLINE DECORATION
  // =====================================

  const isEmptyInlineDecoration =

    isInlineElement

    &&

    !element.children.length

    &&

    !text;

  if (
    isEmptyInlineDecoration
  ) {

    return true;
  }

  // =====================================
  // DECORATIVE TOKENS
  // =====================================

  if (
    isInlineElement &&
    !text &&
    (
      hasClass(
        "bar"
      )

      ||

      hasClass(
        "divider"
      )
    )
  ) {

    return true;
  }

  if (
    isInlineElement &&
    hasClass(
      "gradient-text"
    )
  ) {

    return false;
  }

  if (
    isInlineElement &&
    hasClass(
      "r-num"
    )
  ) {

    return /^[\d\s.:-]+$/.test(
      text
    );
  }

  return false;
};

// =====================================
// SEMANTIC LEAF
// =====================================

const isSemanticLeaf = (
  element: HTMLElement
) => {

  return (

    element.classList.contains(
      "field"
    )

    ||

    element.classList.contains(
      "office"
    )

    ||

    element.classList.contains(
      "crow"
    )
  );
};

// =====================================
// BUILD STRUCTURAL GRAPH
// =====================================

export const buildStructuralGraph = (
  element: HTMLElement,
  path: (string | number)[],
  candidates: StructuralCandidate[],
  parent?: StructuralNode
): StructuralNode | null => {

  if (
    shouldSkipImportedElement(
      element
    )
  ) {

    return null;
  }

  // =====================================
  // PROTECTED SEMANTIC NODES
  // =====================================

  const isProtectedSemanticNode =

    element.classList.contains(
      "crow"
    )

    ||

    element.classList.contains(
      "field"
    )

    ||

    element.classList.contains(
      "office"
    )

    ||

    element.classList.contains(
      "k"
    )

    ||

    element.classList.contains(
      "v"
    );

  // =====================================
  // SKIP DECORATIVE ELEMENTS
  // =====================================

  if (

    !isProtectedSemanticNode &&

    isDecorativeElement(
      element
    )
  ) {

    return null;
  }

  // =====================================
  // COMPUTED STYLE
  // =====================================

  const computedStyle =

    getOwnerComputedStyle(
      element
    );


 const graph: StructuralNode = {
  element,
  path,
  computedStyle,
  candidates: candidates.filter(
    candidate =>
      JSON.stringify(candidate.path) === JSON.stringify(path)
  ),
  children: [],
  parent
};

graph.children =
  isSemanticLeaf(element)
    ? []
    : Array.from(element.children)
        .map((child, index) =>
          buildStructuralGraph(
            child as HTMLElement,
            [...path, index],
            candidates,
            graph
          )
        )
        .filter(Boolean) as StructuralNode[];
        console.log("GRAPH_NODE", {
  tag: element.tagName,
  className: getElementClassName(element),
  path,
  hasParent: Boolean(parent),
  parentTag: parent?.element.tagName
});
  return graph;
};

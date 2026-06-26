import {
  StructuralCandidate
} from "./StructuralCandidate.types";
import {
  getElementClassName,
  getElementClassNameLower,
  getOwnerComputedStyle,
  isHTMLElementLike,
  shouldSkipImportedElement
} from "../domGuards";

export const detectGridGroup = (
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
  // CLASSNAME
  // =====================================

  const className =

    getElementClassNameLower(
      element
    );

  const displayClassName =

    getElementClassName(
      element
    );

  // =====================================
  // SEMANTIC GRID TOKENS
  // =====================================

  const semanticClasses = [
  "grid",
  "columns",

  "contact-grid",
  "values-grid",

  "office-row",

  "vision-pillars",
  "feature-grid",

  "cards",
  "card-grid",

  "svc-grid",

];

  // =====================================
  // COMPUTED STYLE
  // =====================================

  const computed =

    getOwnerComputedStyle(
      element
    );

  // =====================================
  // CHILDREN
  // =====================================

  const children =

    Array.from(
      element.children
    ).filter(
      child =>

        isHTMLElementLike(
          child
        )
    );

  // =====================================
  // DEBUG
  // =====================================

  console.log(
    "🔥 GRID CHECK",
    {

      tag:
        element.tagName,

      className,

      display:
        computed.display,

      gridTemplateColumns:
        computed.gridTemplateColumns,

      childCount:
        children.length,

      path
    }
  );

  // =====================================
  // CLASS SIGNAL
  // =====================================

 const classTokens =

  className
    .split(/\s+/)
    .filter(Boolean);

const classLooksGrid =

  semanticClasses.some(
    token =>

      classTokens.includes(
        token
      )
  );
  // =====================================
  // COMPUTED STYLE SIGNAL
  // =====================================
console.log(
  "CSS RULE CHECK",
  {
    className,
    inlineDisplay: element.style.display,
    computedDisplay: computed.display
  }
);
  const computedLooksGrid =

    computed.display ===
    "grid";

  // =====================================
  // TEMPLATE SIGNAL
  // =====================================

  const templateLooksGrid =

    !!computed.gridTemplateColumns &&

    computed.gridTemplateColumns !==
      "none";

  // =====================================
  // STRUCTURAL SIGNAL
  // =====================================

  const enoughChildren =

    children.length >= 2;

  // =====================================
  // FINAL DECISION
  // =====================================


const tagPenalty = [

  "SPAN",
  "A",
  "LABEL",
  "INPUT",
  "TEXTAREA",
  "BUTTON"
].includes(
  element.tagName
);


const rowLikeClass = [

  "row",
  "crow",
  "field-row",
  "office"
].some(
  token =>

    classTokens.includes(
      token
    )
);

const semanticRootLike =

  children.length >= 2 ||

  classLooksGrid ||

  computedLooksGrid;


  const isSmallInnerGrid =
  computedLooksGrid &&
  templateLooksGrid &&
  children.length <= 4 &&
  !classLooksGrid &&
  children.every(
    child =>
      isHTMLElementLike(child) &&
      child.children.length <= 2
  );

if (isSmallInnerGrid) {
  console.log(
    "🛑 SMALL INNER GRID REJECTED",
    {
      className,
      display:
        computed.display,
      gridTemplateColumns:
        computed.gridTemplateColumns,
      childCount:
        children.length,
      childTags:
        children.map(child => child.tagName)
    }
  );

  return [];
}
if (
  classTokens.includes("mission-grid")
) {
  console.log(
    "MISSION_GRID_REJECT_GENERIC_GRID",
    {
      className,
      path
    }
  );

  return [];
}
 const isGrid =

  !tagPenalty &&

  !rowLikeClass &&

  enoughChildren &&

  semanticRootLike &&

  (
    classLooksGrid ||

    computedLooksGrid ||

    templateLooksGrid
  );

  // =====================================
  // REJECT
  // =====================================

  if (!isGrid) {

    console.log(
      "❌ GRID REJECTED",
      {

        classLooksGrid,

        computedLooksGrid,

        templateLooksGrid,

        enoughChildren
      }
    );

    return [];
  }

  // =====================================
  // SUCCESS
  // =====================================

  console.log(
    "✅ GRID DETECTED",
    {

      element:
        displayClassName,

      path,

      columns:
        computed.gridTemplateColumns
    }
  );

  // =====================================
  // RESULT
  // =====================================

  return [

    {

      type:
        "GRID",

      confidence:
        1,

      path,

      elementId:
        getElementId(
          element
        ),

      metadata: {

        semanticIntent:
          "GRID",

        childCount:
          children.length,

        columns:

          computed.gridTemplateColumns ||

          "semantic-grid",

        detection: {

          classLooksGrid,

          computedLooksGrid,

          templateLooksGrid
        }
      }
    }
  ];
};

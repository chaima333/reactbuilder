import {
  StructuralCandidate
} from "./StructuralCandidate.types";
import {
  getElementClassNameLower,
  getOwnerComputedStyle,
  shouldSkipImportedElement
} from "../domGuards";

export const detectRepeatedTopology = (
  element: HTMLElement,
  path: (string | number)[],
  getElementId: (
    element: HTMLElement
  ) => string
)

: StructuralCandidate[] => {

  if (
    shouldSkipImportedElement(
      element
    )
  ) {

    return [];
  }

  // =====================================
  // CHILDREN
  // =====================================

  const children =
    Array.from(
      element.children
    );

  // =====================================
  // TOO SMALL
  // =====================================

  if (
    children.length < 2
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

  // =====================================
  // CLASS TOKENS
  // =====================================

  const classTokens =

    className.split(
      /\s+/
    );

  // =====================================
  // COMPUTED STYLE
  // =====================================

  const computed =

    getOwnerComputedStyle(
      element
    );

  // =====================================
  // REPEAT LOOKS
  // =====================================

 const looksLikeRepeat =

  classTokens.includes(
    "grid"
  ) ||

  classTokens.includes(
    "pillars"
  ) ||

  classTokens.includes(
    "values"
  ) ||

  classTokens.includes(
    "cards"
  ) ||

  classTokens.includes(
    "features"
  ) ||

  classTokens.includes(
    "crow"
  ) ||

  classTokens.includes(
    "row"
  ) ||

  classTokens.includes(
    "item"
  );

// =====================================
// CHILD STRUCTURE PRECHECK
// =====================================

const childTags =

  children.map(
    child =>
      child.tagName
  );

const repeatedChildTags =

  new Set(
    childTags
  ).size <= 2;

// =====================================
// STRUCTURAL REPEAT SIGNAL
// =====================================

const structuralRepeatSignal =

  children.length >= 2 &&

  repeatedChildTags;

// =====================================
// IGNORE NON REPEATED
// =====================================

if (

  computed.display !==
    "grid"

  &&

  !looksLikeRepeat

  &&

  !structuralRepeatSignal

) {

  console.log(
    "❌ REPEAT REJECTED",
    {
      className,
      display:
        computed.display,

      looksLikeRepeat,

      structuralRepeatSignal
    }
  );

  return [];
}
  // =====================================
  // CHILD SIGNATURES
  // =====================================

 const signatures =
  children.map(child => {

    const headings =
      child.querySelectorAll(
        "h1,h2,h3,h4,h5,h6"
      ).length;

    const paragraphs =
      child.querySelectorAll(
        "p"
      ).length;

    const images =
      child.querySelectorAll(
        "img"
      ).length;

    const actions =
      child.querySelectorAll(
        "a,button"
      ).length;

    return [
      headings ? "H" : "",
      paragraphs ? "P" : "",
      images ? "I" : "",
      actions ? "A" : ""
    ]
      .filter(Boolean)
      .join("-");
  });

    console.log(
  "ELEMENT",
  className
);

console.log(
  "CHILDREN",
  children.length
);

console.log(
  "SIGNATURES",
  signatures
);

  // =====================================
  // FIRST SIGNATURE
  // =====================================

  const first =
    signatures[0];

  // =====================================
  // EMPTY SIGNATURE
  // =====================================

  if (
    !first ||
    first.trim() === ""
  ) {

    return [];
  }

  // =====================================
  // REPEATED TOPOLOGY
  // =====================================

  const signatureFreq =
  new Map<string, number>();

for (const sig of signatures) {

  signatureFreq.set(
    sig,
    (signatureFreq.get(sig) ?? 0) + 1
  );

}

const dominantCount =
  Math.max(
    ...signatureFreq.values()
  );

const ratio =
  dominantCount /
  signatures.length;

const repeated =
  ratio >= 0.6;

  if (
    !repeated
  ) {

    return [];
  }

  // =====================================
  // SEMANTIC CHILD ANALYSIS
  // =====================================

  const semanticChildren =

    children.filter(
      child => {

        const textCount =

          child.querySelectorAll(
            "p,h1,h2,h3,h4,h5,h6,span"
          ).length;

        const imageCount =

          child.querySelectorAll(
            "img"
          ).length;

        const actionCount =

          child.querySelectorAll(
            "button,a"
          ).length;

        const semanticWeight =

          textCount +

          imageCount * 2 +

          actionCount * 2;

        return (
          semanticWeight >= 2
        );
      }
    );

  // =====================================
  // NOT ENOUGH RICH ITEMS
  // =====================================

  if (
    semanticChildren.length < 2
  ) {

    return [];
  }

  // =====================================
  // SEMANTIC INTENT
  // =====================================

 const isRealGrid =

  computed.display ===
    "grid"

  &&

  computed.gridTemplateColumns !==
    "none";

const semanticIntent =

  isRealGrid

    ? "GRID"

    : "GENERIC_REPEAT";


  // =====================================
  // DEBUG
  // =====================================

  console.log(
    "🔥 REPEATED PATTERN",
    {

      semanticIntent:

        isRealGrid

          ? "GRID"

          : "REPEATED_PATTERN",

      elementId:
        getElementId(
          element
        ),

      path,

      repeatedCount:
        children.length,

      signatures,

      uniqueSignatures:
        signatureFreq.size
    }
  );

  // =====================================
  // RESULT
  // =====================================

  return [

  {

    type:

      isRealGrid
        ? "GRID"
        : "REPEATED_PATTERN",

    confidence:
      0.85,

    path,

    elementId:
      getElementId(
        element
      ),

    topologySignature:
      first,

    repeatedIndices:
      children.map(
        (_, index) => index
      ),

  metadata: {

  semanticIntent,

  layoutMode:

    isRealGrid
      ? "GRID"
      : "REPEAT",

  columnCount:
    children.length,

  childCount:
    children.length,

  repeated:
    true
}
  }
];
};

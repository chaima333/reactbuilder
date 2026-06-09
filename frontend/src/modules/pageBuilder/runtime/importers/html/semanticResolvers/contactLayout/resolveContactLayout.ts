import type {
  StructuralNode
} from "../../structure/buildStructuralGraph";
import { extractContactLayout } from "./extractContactLayout";

export const resolveContactLayout = (
  node: StructuralNode
) => {

  

  const element =
    node.element;

  const text =

    element.innerText
      ?.toLowerCase() || "";

  // =====================================
  // CONTACT STRUCTURE
  // =====================================

 const candidates =
  node.candidates || [];
console.log(
  "NODE",
  element.className,
  candidates.map(c => c.type),
  node
);

console.log(
  "CHILDREN",
  node.children.map(
    child => ({
      className:
        child.element.className,
      candidates:
        child.candidates.map(
          c => c.type
        )
    })
  )
);
const hasGridCandidate =

  candidates.some(
    candidate =>

      candidate.type ===
      "GRID"
  );

const repeatedNode =

  node.children.find(
    child =>

      child.candidates.some(
        candidate =>

          candidate.type ===
          "REPEATED_PATTERN"
      )
  );

const hasRepeatedCandidate =

  candidates.some(
    candidate =>

      candidate.type ===
      "REPEATED_PATTERN"
  ) ||

  !!repeatedNode;

const hasForm =

  !!element.querySelector(
    "form"
  );

  // =====================================
  // DETECTION
  // =====================================

  console.log(
  "CONTACT CHECK",
  {
    candidateTypes:
      candidates.map(c => c.type),
    hasGridCandidate,
    hasRepeatedCandidate,
    repeatedNode:
      repeatedNode
        ? {
            className:
              repeatedNode.element.className,
            candidateTypes:
              repeatedNode.candidates.map(
                c => c.type
              )
          }
        : null,
    hasForm
  }
);
console.log(
  "SELF CANDIDATES",
  node.candidates.map(
    c => c.type
  )
  
);

console.log(
  "FORMS FOUND",
  element.querySelectorAll("form").length,
  element.className
);

if (
  hasForm &&
  (hasGridCandidate ||
   hasRepeatedCandidate)
)
  {
    console.log(
      "📞 CONTACT LAYOUT DETECTED"
    );
    console.log(
  "FINAL CONTACT DECISION",
  {
    hasGridCandidate,
    hasRepeatedCandidate,
    hasForm,
    className: element.className
  }
);
    
const payload =
  extractContactLayout(node);


  console.log(
  "🔥 CONTACT PAYLOAD FULL",
  JSON.stringify(
    payload,
    null,
    2
  )
);
return {

  type:
    "CONTACT_LAYOUT",

  ...payload,

  claimedNode:
    node
};
  }

  return null;
};

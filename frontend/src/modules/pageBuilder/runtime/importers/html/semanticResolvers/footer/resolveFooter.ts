import type {
  FooterPayload
} from "../../semanticContracts/FooterPayload";
import type {
  StructuralNode
} from "../../structure/buildStructuralGraph";

export const resolveFooter = (
  node: StructuralNode
): FooterPayload | null => {
  if (
    node.element.tagName !== "FOOTER"
  ) {
    return null;
  }

  return {
    type: "FOOTER",
    confidence: 1,
    reason: [
      "Native footer element"
    ],
    preserveGenericSubtree: true,
    claimedNode: node
  };
};

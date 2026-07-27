import type {
  StructuralNode
} from "../../structure/buildStructuralGraph";

import type {
  ServicePageSectionPayload
} from "../semanticContracts/ServicePageSectionPayload";

export const resolveServicePageSection = (
  node: StructuralNode
): ServicePageSectionPayload | null => {
  if (
    !node.element.classList.contains(
      "markets"
    )
  ) {
    return null;
  }

  return {
    type: "SERVICE_PAGE_SECTION",
    variant: "SERVICE_MARKETS",
    claimedNode: node
  };
};

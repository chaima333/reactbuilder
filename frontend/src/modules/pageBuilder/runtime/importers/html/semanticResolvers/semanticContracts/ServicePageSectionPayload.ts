import type {
  StructuralNode
} from "../../structure/buildStructuralGraph";

export type ServicePageSectionVariant =
  | "SERVICE_INTRO_GRID"
  | "SERVICE_DELIVERABLES"
  | "SERVICE_MARKETS"
  | "SERVICE_CTA"
  | "SERVICE_HEADING"
  | "SERVICE_CARDS";

export type ServicePageSectionPayload = {
  type:
    "SERVICE_PAGE_SECTION";
  variant:
    ServicePageSectionVariant;
  claimedNode:
    StructuralNode;
};

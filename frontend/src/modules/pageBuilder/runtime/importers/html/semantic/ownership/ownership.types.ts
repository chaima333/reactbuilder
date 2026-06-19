import { StructuralCandidate } from "../../analysis/StructuralCandidate.types";

export type SemanticOwnerType =
  | "HERO"
  | "NAVBAR"
  | "FOOTER"
  | "GRID"
  | "CARD"
  | "FORM"
  | "FIELD"
  | "CTA"
  | "REPEATED_COLLECTION"
  | "FLEX_GROUP";

export type OwnershipRelation =
  | "owns"
  | "belongs_to"
  | "contains"
  | "groups"
  | "siblings_with";

export interface OwnershipEdge {
  fromId: string;
  toId: string;
  relation: OwnershipRelation;
  ownerType: SemanticOwnerType;
  confidence: number;
  reason: string[];
}

export interface OwnershipAssignment {
  nodeId: string;
  ownerId: string;
  ownerType: SemanticOwnerType;
  relation: OwnershipRelation;
  confidence: number;
  reason: string[];
}

export interface OwnershipResult {
  ownershipMap: Record<string, OwnershipAssignment[]>;
  relations: OwnershipEdge[];
  resolvedOwners: StructuralCandidate[];
  unassigned: StructuralCandidate[];
}

export type {
  StructuralCandidate
};

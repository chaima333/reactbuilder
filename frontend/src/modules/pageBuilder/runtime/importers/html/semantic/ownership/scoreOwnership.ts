import type {
  StructuralCandidate,
  SemanticOwnerType,
  OwnershipRelation
} from "./ownership.types";

import {
  samePath,
  isAncestorPath,
  parentPath,
  pathDepth,
  commonPrefixLength
} from "./pathUtils";

export interface OwnershipScore {
  ownerId: string;
  ownerType: SemanticOwnerType;
  relation: OwnershipRelation;
  confidence: number;
  reason: string[];
}

const typePriority: Record<StructuralCandidate["type"], number> = {
  NAVBAR: 100,
  GRID: 90,
  REPEATED_PATTERN: 80,
  CARD: 70,
  FLEX_GROUP: 50
};

const ownerPriority: Record<SemanticOwnerType, number> = {
  NAVBAR: 100,
  HERO: 95,
  FORM: 90,
  GRID: 85,
  REPEATED_COLLECTION: 80,
  CARD: 70,
  CTA: 65,
  FIELD: 60,
  FLEX_GROUP: 50
};

const semanticIntentToOwner: Record<string, SemanticOwnerType> = {
  HERO: "HERO",
  NAVBAR: "NAVBAR",
  GRID: "GRID",
  CARD: "CARD",
  FORM: "FORM",
  CTA: "CTA",
  FIELD: "FIELD",
  REPEATED_COLLECTION: "REPEATED_COLLECTION"
};

const getSemanticIntent = (candidate: StructuralCandidate): string | undefined => {
  const intent = candidate.metadata?.semanticIntent;
  return typeof intent === "string" ? intent : undefined;
};

const getOwnerType = (candidate: StructuralCandidate): SemanticOwnerType => {
  const intent = getSemanticIntent(candidate);
  if (intent && semanticIntentToOwner[intent]) return semanticIntentToOwner[intent];

  if (candidate.type === "REPEATED_PATTERN") {
    const topo = candidate.topologySignature;
    if (topo) return "REPEATED_COLLECTION";
    return "FLEX_GROUP";
  }

  if (candidate.type === "NAVBAR") return "NAVBAR";
  if (candidate.type === "GRID") return "GRID";
  if (candidate.type === "CARD") return "CARD";
  return "FLEX_GROUP";
};

const inferRelation = (
  owner: StructuralCandidate,
  node: StructuralCandidate
): OwnershipRelation => {
  if (samePath(owner.path, parentPath(node.path))) return "owns";
  if (isAncestorPath(owner.path, node.path)) return "contains";

  const prefix = commonPrefixLength(owner.path, node.path);
  const nearSibling =
    prefix >= Math.min(owner.path.length, node.path.length) - 1;

  if (nearSibling) return "groups";
  return "belongs_to";
};

const pathProximityScore = (owner: StructuralCandidate, node: StructuralCandidate) => {
  const depthDelta = Math.abs(pathDepth(owner.path) - pathDepth(node.path));
  return Math.max(0, 30 - depthDelta * 8);
};

const topologyScore = (owner: StructuralCandidate, node: StructuralCandidate) => {
  if (!owner.topologySignature || !node.topologySignature) return 0;
  return owner.topologySignature === node.topologySignature ? 15 : 0;
};

const repeatedScore = (owner: StructuralCandidate) => {
  return owner.type === "REPEATED_PATTERN" ? 12 : 0;
};

const relationScore = (
  relation: OwnershipRelation
) => {

  switch (relation) {

    case "owns":
      return 35;

    case "contains":
      return 20;

    case "groups":
      return 10;

    case "belongs_to":
      return 5;

    case "siblings_with":
      return 3;
  }
};

const ownerTypeScore = (ownerType: SemanticOwnerType) => {
  return ownerPriority[ownerType] / 10;
};

export const scoreOwnership = (
  node: StructuralCandidate,
  owners: StructuralCandidate[]
): OwnershipScore[] => {
  const baseConfidence = node.confidence;

  return owners
    .filter(owner => owner.elementId !== node.elementId)
    .map(owner => {
      const ownerType = getOwnerType(owner);
      const relation = inferRelation(owner, node);

      const score =
        baseConfidence * 0.35 +
        owner.confidence * 0.20 +
        typePriority[owner.type] * 0.15 +
        pathProximityScore(owner, node) +
        topologyScore(owner, node) +
        repeatedScore(owner) +
        relationScore(relation) +
        ownerTypeScore(ownerType);

      const confidence = Math.max(0, Math.min(100, score));

      const reason = [
        `node:${node.type}`,
        `owner:${owner.type}`,
        `ownerType:${ownerType}`,
        `relation:${relation}`,
        `base:${baseConfidence.toFixed(2)}`,
        `ownerConfidence:${owner.confidence.toFixed(2)}`,
        isAncestorPath(owner.path, node.path) ? "ancestor-match" : "",
        samePath(owner.path, parentPath(node.path)) ? "parent-match" : "",
        owner.topologySignature &&
        node.topologySignature &&
        owner.topologySignature === node.topologySignature
          ? "topology-match"
          : "",
        owner.type === "REPEATED_PATTERN" ? "repeat-pattern" : ""
      ].filter(Boolean);

      return {
        ownerId: owner.elementId,
        ownerType,
        relation,
        confidence,
        reason
      };
    })
    .sort((a, b) => {
      if (b.confidence !== a.confidence) return b.confidence - a.confidence;
      if (ownerPriority[b.ownerType] !== ownerPriority[a.ownerType]) {
        return ownerPriority[b.ownerType] - ownerPriority[a.ownerType];
      }
      return a.ownerId.localeCompare(b.ownerId);
    });
};
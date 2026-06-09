import type {
  StructuralCandidate,
  OwnershipAssignment,
  OwnershipEdge,
  OwnershipResult,
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

export interface OwnershipRelationGroup {
  ownerId: string;
  ownerType: SemanticOwnerType;
  children: OwnershipEdge[];
}

export interface BuildOwnershipMapInput {
  candidates: StructuralCandidate[];
  assignments: OwnershipAssignment[];
}

const ownerRank: Record<SemanticOwnerType, number> = {
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

const relationRank: Record<OwnershipRelation, number> = {
  owns: 40,
  contains: 30,
  groups: 20,
  belongs_to: 10,
  siblings_with: 5
};

const stableSortEdges = (edges: OwnershipEdge[]) => {
  return [...edges].sort((a, b) => {
    if (a.confidence !== b.confidence) return b.confidence - a.confidence;
    if (ownerRank[a.ownerType] !== ownerRank[b.ownerType]) {
      return ownerRank[b.ownerType] - ownerRank[a.ownerType];
    }
    if (relationRank[a.relation] !== relationRank[b.relation]) {
      return relationRank[b.relation] - relationRank[a.relation];
    }
    if (a.fromId !== b.fromId) return a.fromId.localeCompare(b.fromId);
    return a.toId.localeCompare(b.toId);
  });
};

const findCandidateById = (
  candidates: StructuralCandidate[],
  id: string
): StructuralCandidate | undefined => {
  return candidates.find(candidate => candidate.elementId === id);
};

const resolveSemanticParent = (
  node: StructuralCandidate,
  candidates: StructuralCandidate[]
): StructuralCandidate | undefined => {
  const exactParent = candidates.find(candidate =>
    samePath(candidate.path, parentPath(node.path))
  );
  if (exactParent) return exactParent;

  const ancestors = candidates
    .filter(candidate => isAncestorPath(candidate.path, node.path))
    .sort((a, b) => {
      const depthDiff = pathDepth(b.path) - pathDepth(a.path);
      if (depthDiff !== 0) return depthDiff;
      const prefix = commonPrefixLength(a.path, node.path);
      const prefixB = commonPrefixLength(b.path, node.path);
      if (prefixB !== prefix) return prefixB - prefix;
      return a.elementId.localeCompare(b.elementId);
    });

  return ancestors[0];
};

export const groupOwnershipRelations = (
  assignments: OwnershipAssignment[]
): OwnershipRelationGroup[] => {
  const groups = new Map<string, OwnershipRelationGroup>();

  for (const assignment of assignments) {
    const current = groups.get(assignment.ownerId);
    if (current) {
      current.children.push({
        fromId: assignment.ownerId,
        toId: assignment.nodeId,
        relation: assignment.relation,
        ownerType: assignment.ownerType,
        confidence: assignment.confidence,
        reason: assignment.reason
      });
    } else {
      groups.set(assignment.ownerId, {
        ownerId: assignment.ownerId,
        ownerType: assignment.ownerType,
        children: [
          {
            fromId: assignment.ownerId,
            toId: assignment.nodeId,
            relation: assignment.relation,
            ownerType: assignment.ownerType,
            confidence: assignment.confidence,
            reason: assignment.reason
          }
        ]
      });
    }
  }

  return [...groups.values()].map(group => ({
    ...group,
    children: stableSortEdges(group.children)
  }));
};

export const getOwnedChildren = (
  ownerId: string,
  ownershipMap: Record<string, OwnershipAssignment[]>
): OwnershipAssignment[] => {
  const result: OwnershipAssignment[] = [];
  for (const assignments of Object.values(ownershipMap)) {
    for (const assignment of assignments) {
      if (assignment.ownerId === ownerId) result.push(assignment);
    }
  }
  return result.sort((a, b) => {
    if (a.confidence !== b.confidence) return b.confidence - a.confidence;
    if (a.ownerType !== b.ownerType) return a.ownerType.localeCompare(b.ownerType);
    return a.nodeId.localeCompare(b.nodeId);
  });
};

export const buildOwnershipMap = (
  input: BuildOwnershipMapInput
): OwnershipResult => {
  const { candidates, assignments } = input;

  const ownershipMap: Record<string, OwnershipAssignment[]> = {};
  const relations: OwnershipEdge[] = [];
  const resolvedOwners: StructuralCandidate[] = [];
  const unassigned: StructuralCandidate[] = [];

  const assignmentByNode = new Map<string, OwnershipAssignment>();
  for (const assignment of assignments) {
    assignmentByNode.set(assignment.nodeId, assignment);
  }

  for (const candidate of candidates) {
    const assignment = assignmentByNode.get(candidate.elementId);

    if (!assignment) {
      ownershipMap[candidate.elementId] = [];
      unassigned.push(candidate);
      continue;
    }

    ownershipMap[candidate.elementId] = [assignment];
    resolvedOwners.push(candidate);
    relations.push({
      fromId: assignment.ownerId,
      toId: assignment.nodeId,
      relation: assignment.relation,
      ownerType: assignment.ownerType,
      confidence: assignment.confidence,
      reason: assignment.reason
    });
  }

  const grouped = groupOwnershipRelations(assignments);

  const relationIndex = new Map<string, OwnershipEdge[]>();
  for (const edge of relations) {
    const list = relationIndex.get(edge.fromId);
    if (list) list.push(edge);
    else relationIndex.set(edge.fromId, [edge]);
  }

  const finalRelations = stableSortEdges(relations);

  return {
    ownershipMap,
    relations: finalRelations,
    resolvedOwners,
    unassigned
  };
};
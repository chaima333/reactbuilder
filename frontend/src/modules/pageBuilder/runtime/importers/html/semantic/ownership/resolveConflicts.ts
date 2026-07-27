import type {
  OwnershipAssignment,
  SemanticOwnerType
} from "./ownership.types";

import type { OwnershipScore } from "./scoreOwnership";

const ownerPriority: Record<SemanticOwnerType, number> = {
  NAVBAR: 100,
  FOOTER: 98,
  HERO: 95,
  FORM: 90,
  GRID: 85,
  REPEATED_COLLECTION: 80,
  CARD: 70,
  CTA: 65,
  FIELD: 60,
  FLEX_GROUP: 50
};

const relationPriority: Record<
  OwnershipScore["relation"],
  number
> = {

  owns: 40,
  contains: 30,
  groups: 20,
  belongs_to: 10,
  siblings_with: 5
};

const ownerTypeKindPriority: Record<SemanticOwnerType, number> = {
  NAVBAR: 100,
  FOOTER: 98,
  HERO: 95,
  FORM: 90,
  GRID: 85,
  REPEATED_COLLECTION: 80,
  CARD: 70,
  CTA: 65,
  FIELD: 60,
  FLEX_GROUP: 50
};

export interface ConflictResolutionTrace {
  reason: string[];
  rejected?: OwnershipScore[];
}

export interface ResolvedOwnershipConflict {
  winner: OwnershipScore | null;
  runnerUp: OwnershipScore | null;
  trace: ConflictResolutionTrace;
}

export interface OwnershipResolutionResult {
  assignment: OwnershipAssignment | null;
  trace: ConflictResolutionTrace;
}

const stableRank = (score: OwnershipScore) => {
  return (
    score.confidence * 1000 +
    ownerPriority[score.ownerType] * 10 +
    relationPriority[score.relation] * 5 +
    ownerTypeKindPriority[score.ownerType]
  );
};

const isSemanticContainer = (ownerType: SemanticOwnerType) => {
  return (
    ownerType === "NAVBAR" ||
    ownerType === "HERO" ||
    ownerType === "FORM" ||
    ownerType === "GRID" ||
    ownerType === "REPEATED_COLLECTION"
  );
};

const blocksGenericBleed = (
  winner: OwnershipScore,
  candidate: OwnershipScore
): boolean => {
  if (winner.ownerType === candidate.ownerType) return false;

  if (isSemanticContainer(winner.ownerType) && candidate.ownerType === "FLEX_GROUP") {
    return true;
  }

  if (
    (winner.ownerType === "NAVBAR" || winner.ownerType === "HERO") &&
    candidate.ownerType === "CARD"
  ) {
    return true;
  }

  if (
    winner.ownerType === "FORM" &&
    candidate.ownerType === "REPEATED_COLLECTION"
  ) {
    return true;
  }

  return false;
};

const compareScores = (a: OwnershipScore, b: OwnershipScore): number => {
  if (a.confidence !== b.confidence) return b.confidence - a.confidence;

  const ap = ownerPriority[a.ownerType];
  const bp = ownerPriority[b.ownerType];
  if (ap !== bp) return bp - ap;

  const ar = relationPriority[a.relation];
  const br = relationPriority[b.relation];
  if (ar !== br) return br - ar;

  const arank = stableRank(a);
  const brank = stableRank(b);
  if (arank !== brank) return brank - arank;

  return a.ownerId.localeCompare(b.ownerId);
};

export const resolveOwnershipConflict = (
  scores: OwnershipScore[]
): ResolvedOwnershipConflict => {
  if (!scores.length) {
    return {
      winner: null,
      runnerUp: null,
      trace: {
        reason: ["no-candidates"]
      }
    };
  }

  const sorted = [...scores].sort(compareScores);
  const winner = sorted[0];
  const runnerUp = sorted[1] ?? null;

  const filtered = sorted.filter(score => {
    if (score === winner) return true;
    if (blocksGenericBleed(winner, score)) return false;
    return true;
  });

  const finalWinner = filtered[0] ?? winner;

  return {
    winner: finalWinner,
    runnerUp,
    trace: {
      reason: [
        `winner:${finalWinner.ownerType}`,
        `confidence:${finalWinner.confidence.toFixed(2)}`,
        `relation:${finalWinner.relation}`,
        isSemanticContainer(finalWinner.ownerType) ? "semantic-container" : "generic-owner",
        runnerUp ? `runnerUp:${runnerUp.ownerType}` : "no-runner-up"
      ],
      rejected: sorted.slice(1)
    }
  };
};

export const resolveOwnershipAssignments = (
  nodeId: string,
  scores: OwnershipScore[]
): OwnershipResolutionResult => {
  const conflict = resolveOwnershipConflict(scores);

  if (!conflict.winner) {
    return {
      assignment: null,
      trace: conflict.trace
    };
  }

  const assignment: OwnershipAssignment = {
    nodeId,
    ownerId: conflict.winner.ownerId,
    ownerType: conflict.winner.ownerType,
    relation: conflict.winner.relation,
    confidence: conflict.winner.confidence,
    reason: conflict.trace.reason
  };

  return {
    assignment,
    trace: conflict.trace
  };
};

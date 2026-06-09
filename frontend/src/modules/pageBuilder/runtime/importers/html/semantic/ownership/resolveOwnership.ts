import { buildOwnershipMap } from "./buildOwnershipMap";
import { OwnershipAssignment, StructuralCandidate } from "./ownership.types";
import { resolveOwnershipAssignments } from "./resolveConflicts";
import { scoreOwnership } from "./scoreOwnership";

export const resolveOwnership = (
  candidates: StructuralCandidate[]
) => {
  console.log("🔥 BEFORE OWNERSHIP", candidates);

  const assignments = candidates
    .map(candidate => {
      const possibleOwners = candidates.filter(
        owner => owner.elementId !== candidate.elementId
      );

      const scores = scoreOwnership(candidate, possibleOwners);

      const resolved = resolveOwnershipAssignments(
        candidate.elementId,
        scores
      );

      console.log("🧠 OWNERSHIP RESOLUTION", {
        node: candidate.type,
        nodeId: candidate.elementId,
        assignment: resolved.assignment,
        trace: resolved.trace
      });

      return resolved.assignment;
    })
    .filter(
      (assignment): assignment is OwnershipAssignment => assignment !== null
    );

  const ownershipGraph = buildOwnershipMap({
    candidates,
    assignments
  });

  console.log("🔥 FINAL OWNERSHIP", ownershipGraph);

  return ownershipGraph;
};
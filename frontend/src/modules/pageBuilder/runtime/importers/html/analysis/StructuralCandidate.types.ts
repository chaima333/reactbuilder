export type CandidateType =
  | "GRID"
  | "CARD"
  | "NAVBAR"
  | "FLEX_GROUP"
  | "REPEATED_PATTERN";

export interface StructuralCandidate {

  type: CandidateType;

  confidence: number;

  path: (string | number)[];

  topologySignature?: string;

  repeatedIndices?: number[];

  elementId: string;

  metadata?: Record<string, unknown>;
}